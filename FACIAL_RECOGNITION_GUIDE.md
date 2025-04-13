# Train Security Facial Recognition System Guide

This guide provides comprehensive instructions on setting up, testing, and using the facial recognition system for train security. The system uses a pre-trained ResNet model via face-api.js to perform real-time facial recognition for authorizing passengers and detecting unauthorized entries.

## Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Downloading Models](#downloading-models)
3. [Running the Application](#running-the-application)
4. [Using the Facial Recognition System](#using-the-facial-recognition-system)
   - [Enrolling Your Face](#enrolling-your-face)
   - [Live Recognition](#live-recognition)
   - [Viewing Unauthorized Detections](#viewing-unauthorized-detections)
5. [Testing the System](#testing-the-system)
6. [Technical Details](#technical-details)

## Setup Instructions

Before you can use the facial recognition system, you need to set up the required dependencies and download the pre-trained models.

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository (if you haven't already):
   ```
   git clone <repository-url>
   cd trackguard-3d-portal-main
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

## Downloading Models

The facial recognition system uses pre-trained models from face-api.js. These models need to be downloaded separately due to their size.

1. Run the provided download script:
   ```
   npm run download-models
   ```
   or
   ```
   yarn download-models
   ```

   This will download all required models to the `public/models` directory.

2. After downloading, you can verify the models were downloaded correctly by visiting:
   ```
   http://localhost:3000/models/test.html
   ```
   (After starting the application with `npm run dev` or `yarn dev`)

## Running the Application

Start the development server:

```
npm run dev
```
or
```
yarn dev
```

The application will be available at: `http://localhost:3000`

## Using the Facial Recognition System

### Accessing the Security Dashboard

1. Log in to the application using any email and password (the application uses mock authentication)
2. Select the role "TTE" (Train Ticket Examiner) during login
3. Click on the "Security" menu item in the sidebar

### Enrolling Your Face

Before testing the facial recognition, you need to enroll your face (or any face you want to test with):

1. In the Security Dashboard, click on the "Enroll New Person" tab
2. Fill in the form with the following information:
   - Full Name: Your name or any name you want to use
   - Role: Choose from Passenger, Train Ticket Examiner, or Security Personnel
   - Ticket ID: (Optional, only for passengers) Enter any ticket ID
3. Click the "Capture Face" button
4. Position your face in the center of the frame and click "Capture"
5. Verify the image looks clear and click "Accept"
6. Your face is now enrolled in the system

### Live Recognition

To test the facial recognition system:

1. Click on the "Live Recognition" tab
2. Select a coach for surveillance (e.g., A1, B1, etc.)
3. Click "Start Recognition"
4. The system will now process the webcam feed and detect faces
5. Each detected face will be:
   - Outlined in green if it's an authorized person
   - Outlined in red if it's an unauthorized person
   - Outlined in yellow if it's an unrecognized person

6. You will see real-time statistics showing:
   - Number of authorized personnel detected
   - Number of unauthorized personnel detected
   - Number of unrecognized faces

7. Click "Stop Recognition" when done

### Viewing Unauthorized Detections

If any unauthorized faces are detected:

1. A security alert will appear at the top of the dashboard
2. Click on the "Unauthorized Detections" tab to view details of all unauthorized faces detected

## Testing the System

To fully test the facial recognition system, follow these steps:

1. Enroll your face as an authorized person (follow steps in "Enrolling Your Face")
2. Start the live recognition and verify your face is recognized correctly
3. To test unauthorized detection:
   - Enroll another face (or ask someone else to help), but set "isAuthorized" to false
   - Or modify the code in `src/services/faceApiService.ts` to sometimes return unauthorized matches
4. Try different lighting conditions, angles, and distances to test the robustness of the system

## Technical Details

The facial recognition system uses the following components:

- **face-api.js**: JavaScript face detection and recognition library
- **ResNet model**: Deep neural network architecture for facial recognition
- **React Webcam**: For capturing video from the camera
- **HTML Canvas**: For drawing recognition results over the video

### Key Files

- `src/services/faceApiService.ts`: Core service for facial recognition
- `src/components/security/EnhancedFacialRecognition.tsx`: Main component for facial recognition UI
- `src/components/security/WebcamCapture.tsx`: Component for capturing facial images
- `public/models/`: Directory containing pre-trained ResNet models

### How It Works

1. **Face Detection**: The system first detects faces in the video stream using a TinyFaceDetector model
2. **Face Recognition**: Each detected face is processed by the ResNet model to extract facial features (descriptors)
3. **Face Matching**: These descriptors are compared against the database of enrolled faces
4. **Authorization Check**: Based on the match result, the system determines if the person is authorized or not
5. **Alert Generation**: If unauthorized persons are detected, the system generates alerts

---

For more information or if you encounter any issues, please refer to the project repository or contact the development team.

Happy testing! 