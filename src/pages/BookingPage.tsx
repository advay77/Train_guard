
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export function BookingPage() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    idNumber: "",
    from: "",
    to: "",
    date: "",
    class: ""
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if photo is uploaded
    if (!photoFile) {
      toast.error("Please upload a photo for identity verification");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would upload the data to your server here
      console.log("Form Data:", formData);
      console.log("Photo File:", photoFile);
      
      toast.success("Ticket booked successfully! Check your email for confirmation.");
      setIsSubmitting(false);
      
      // Reset form (in a real app, you might redirect to a confirmation page)
      setFormData({
        name: "",
        age: "",
        gender: "",
        idNumber: "",
        from: "",
        to: "",
        date: "",
        class: ""
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Book Train Ticket</h1>
        <p className="text-muted-foreground">
          Fill in your details to book a secure train ticket
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Enter your details for identity verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    name="age" 
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="120"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="idNumber">ID Number</Label>
                <Input 
                  id="idNumber" 
                  name="idNumber" 
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  placeholder="Passport or National ID"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Photo for ID Verification</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed rounded-lg p-4 border-muted-foreground/25 hover:border-primary/50 transition-colors">
                    <label htmlFor="photo-upload" className="flex flex-col items-center justify-center cursor-pointer h-full">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-4">
                          <Upload className="h-8 w-8 mb-2" />
                          <span className="text-sm">Click to upload</span>
                          <span className="text-xs mt-1">JPG, PNG up to 5MB</span>
                        </div>
                      )}
                      <Input 
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p>Requirements:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Clear, recent photo</li>
                      <li>Face clearly visible</li>
                      <li>No sunglasses or hats</li>
                      <li>Neutral background</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle>Journey Details</CardTitle>
              <CardDescription>
                Enter your travel information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from">From Station</Label>
                <Input 
                  id="from" 
                  name="from" 
                  value={formData.from}
                  onChange={handleInputChange}
                  placeholder="Departure Station"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="to">To Station</Label>
                <Input 
                  id="to" 
                  name="to" 
                  value={formData.to}
                  onChange={handleInputChange}
                  placeholder="Arrival Station"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Travel Date</Label>
                <Input 
                  id="date" 
                  name="date" 
                  type="date" 
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="class">Travel Class</Label>
                <Select 
                  value={formData.class} 
                  onValueChange={(value) => handleSelectChange("class", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="px-6 pt-4 border-t">
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Book Ticket"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
