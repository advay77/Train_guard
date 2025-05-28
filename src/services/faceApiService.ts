import * as faceapi from 'face-api.js';
import { toast } from 'sonner';
import { FaceData } from './facialRecognitionService';

// Path to the models
const MODEL_URL = '/models';

// Initialize flag to track if models are loaded
let isModelsLoaded = false;

// Class to handle face API facial recognition
export class FaceApiService {
  private static instance: FaceApiService;
  private faceDescriptors: { person: FaceData; descriptor: Float32Array }[] = [];
  private faceMatcher: faceapi.FaceMatcher | null = null;
  private isInitialized = false;
  private labeledFaceDescriptors: faceapi.LabeledFaceDescriptors[] = [];

  // Private constructor for singleton pattern
  private constructor() {}

  // Get the singleton instance
  public static getInstance(): FaceApiService {
    if (!FaceApiService.instance) {
      FaceApiService.instance = new FaceApiService();
    }
    return FaceApiService.instance;
  }

  // Initialize the face API service
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Load the models
      await this.loadModels();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing FaceApiService:', error);
      toast.error('Failed to initialize facial recognition system');
      return false;
    }
  }

  // Load the models
  private async loadModels(): Promise<void> {
    if (isModelsLoaded) return;

    try {
      // Display loading toast
      const toastId = toast.loading('Loading facial recognition models...');

      // Load face detection model
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      
      // Load face landmark model (for better face recognition)
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      
      // Load the face recognition model (ResNet)
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      
      // Load the expression model (optional, can be useful for additional features)
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

      // Update the toast
      toast.dismiss(toastId);
      toast.success('Facial recognition models loaded successfully');
      
      isModelsLoaded = true;
    } catch (error) {
      console.error('Error loading models:', error);
      toast.error('Failed to load facial recognition models');
      throw error;
    }
  }

  // Add a person to the recognition database with face descriptor
  public async addPersonFace(
    person: FaceData,
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<boolean> {
    try {
      await this.initialize();

      // Detect face in the image
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error('No face detected in the image');
        return false;
      }

      // Add the face descriptor to the database
      this.faceDescriptors.push({
        person,
        descriptor: detection.descriptor
      });

      // Update face matcher
      this.updateFaceMatcher();

      toast.success(`${person.name} added to facial recognition database`);
      return true;
    } catch (error) {
      console.error('Error adding person face:', error);
      toast.error('Failed to add person to facial recognition database');
      return false;
    }
  }

  // Update face matcher with current descriptors
  private updateFaceMatcher() {
    // Create labeled face descriptors
    const descriptorMap = this.faceDescriptors.reduce<{ [key: string]: Float32Array[] }>(
      (acc, { person, descriptor }) => {
        const id = person.faceId;
        if (!acc[id]) {
          acc[id] = [];
        }
        acc[id].push(descriptor);
        return acc;
      },
      {}
    );
    this.labeledFaceDescriptors = Object.entries(descriptorMap).map(([id, descriptors]) => {
      const person = this.faceDescriptors.find(d => d.person.faceId === id)?.person;
      return new faceapi.LabeledFaceDescriptors(
        id, 
        descriptors
      );
    });

    // Create face matcher
    this.faceMatcher = new faceapi.FaceMatcher(this.labeledFaceDescriptors, 0.6);
  }

  // Detect and recognize faces in an image/video frame
  public async detectAndRecognizeFaces(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
  ): Promise<{
    detectedFaces: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[];
    recognizedPersons: { detection: faceapi.FaceDetection; person: FaceData | null; distance: number }[];
  }> {
    await this.initialize();

    // Default empty results
    const defaultResult = {
      detectedFaces: [],
      recognizedPersons: []
    };

    try {
      // Detect all faces in the image with landmarks and descriptors
      const detections = await faceapi
        .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections || detections.length === 0) {
        return defaultResult;
      }

      // If no face matcher exists, create it
      if (!this.faceMatcher && this.faceDescriptors.length > 0) {
        this.updateFaceMatcher();
      }

      // If we have a face matcher, match detected faces
      const recognizedPersons = detections.map(detection => {
        // Default result (unrecognized)
        let result = {
          detection: detection.detection,
          person: null,
          distance: 1.0 // Max distance
        };

        // If we have a face matcher, try to match
        if (this.faceMatcher) {
          const match = this.faceMatcher.findBestMatch(detection.descriptor);
          
          if (match && match.label !== 'unknown') {
            const person = this.faceDescriptors.find(d => d.person.faceId === match.label)?.person || null;
            result = {
              detection: detection.detection,
              person,
              distance: match.distance
            };
          }
        }

        return result;
      });

      return {
        detectedFaces: detections,
        recognizedPersons
      };
    } catch (error) {
      console.error('Error in detectAndRecognizeFaces:', error);
      return defaultResult;
    }
  }

  // Remove a person from the recognition database
  public removePerson(faceId: string): boolean {
    const initialLength = this.faceDescriptors.length;
    
    // Remove all face descriptors of the person
    this.faceDescriptors = this.faceDescriptors.filter(
      item => item.person.faceId !== faceId
    );
    
    // If any descriptor was removed, update the face matcher
    if (initialLength !== this.faceDescriptors.length) {
      if (this.faceDescriptors.length > 0) {
        this.updateFaceMatcher();
      } else {
        this.faceMatcher = null;
      }
      return true;
    }
    
    return false;
  }

  // Bulk load authorized personnel with their face images
  public async bulkLoadPersonnel(
    personnel: { person: FaceData; imageUrl: string }[]
  ): Promise<number> {
    let successCount = 0;

    for (const { person, imageUrl } of personnel) {
      try {
        // Create an image element
        const img = new Image();
        img.src = imageUrl;
        
        // Wait for the image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Add the person's face
        const success = await this.addPersonFace(person, img);
        if (success) {
          successCount++;
        }
      } catch (error) {
        console.error(`Error loading face for ${person.name}:`, error);
      }
    }

    toast.success(`Successfully loaded ${successCount} of ${personnel.length} faces`);
    return successCount;
  }

  // Get the count of registered faces
  public getRegisteredFacesCount(): number {
    return this.faceDescriptors.length;
  }

  // Get all registered persons
  public getRegisteredPersons(): FaceData[] {
    return this.faceDescriptors.map(item => item.person);
  }

  // Export face descriptors for persistence
  public exportFaceData(): {
    faceId: string;
    name: string;
    isAuthorized: boolean;
    descriptorBase64: string;
    role?: string;
    ticketId?: string;
  }[] {
    return this.faceDescriptors.map(({ person, descriptor }) => ({
      faceId: person.faceId,
      name: person.name,
      isAuthorized: person.isAuthorized,
      role: person.role,
      ticketId: person.ticketId,
      descriptorBase64: this.float32ArrayToBase64(descriptor)
    }));
  }

  // Import face descriptors from persistence
  public importFaceData(
    data: {
      faceId: string;
      name: string;
      isAuthorized: boolean;
      descriptorBase64: string;
      role?: string;
      ticketId?: string;
    }[]
  ): number {
    let importCount = 0;

    for (const item of data) {
      try {
        const descriptor = this.base64ToFloat32Array(item.descriptorBase64);
        
        // Create person data
        const person: FaceData = {
          faceId: item.faceId,
          name: item.name,
          isAuthorized: item.isAuthorized,
          role: item.role,
          ticketId: item.ticketId
        };

        // Add to descriptors
        this.faceDescriptors.push({
          person,
          descriptor
        });

        importCount++;
      } catch (error) {
        console.error(`Error importing face for ${item.name}:`, error);
      }
    }

    // If any faces were imported, update the face matcher
    if (importCount > 0) {
      this.updateFaceMatcher();
    }

    return importCount;
  }

  // Helper method to convert Float32Array to Base64 string
  private float32ArrayToBase64(array: Float32Array): string {
    const buffer = new ArrayBuffer(array.length * 4);
    const view = new DataView(buffer);
    
    for (let i = 0; i < array.length; i++) {
      view.setFloat32(i * 4, array[i], true);
    }
    
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }

  // Helper method to convert Base64 string to Float32Array
  private base64ToFloat32Array(base64: string): Float32Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const buffer = bytes.buffer;
    const view = new DataView(buffer);
    
    const result = new Float32Array(binary.length / 4);
    for (let i = 0; i < result.length; i++) {
      result[i] = view.getFloat32(i * 4, true);
    }
    
    return result;
  }
} 