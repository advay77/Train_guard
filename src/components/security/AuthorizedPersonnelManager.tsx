import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  Fingerprint, 
  Plus, 
  Search, 
  Trash2, 
  User, 
  UserCheck, 
  UserPlus 
} from "lucide-react";
import { 
  addAuthorizedPerson, 
  getAllAuthorizedPersonnel, 
  removeAuthorizedPerson,
  FaceData
} from "@/services/facialRecognitionService";

export function AuthorizedPersonnelManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [personnel, setPersonnel] = useState<FaceData[]>(getAllAuthorizedPersonnel());
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonRole, setNewPersonRole] = useState("passenger");
  const [newPersonTicketId, setNewPersonTicketId] = useState("");
  
  // Filter personnel based on search
  const filteredPersonnel = personnel.filter(person => 
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (person.role && person.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (person.ticketId && person.ticketId.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Handle adding new person
  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;
    
    const newPerson = addAuthorizedPerson({
      name: newPersonName,
      isAuthorized: true,
      role: newPersonRole as any,
      ticketId: newPersonTicketId || undefined
    });
    
    setPersonnel(getAllAuthorizedPersonnel());
    
    // Reset form
    setNewPersonName("");
    setNewPersonRole("passenger");
    setNewPersonTicketId("");
  };
  
  // Handle removing a person
  const handleRemovePerson = (faceId: string) => {
    if (removeAuthorizedPerson(faceId)) {
      setPersonnel(getAllAuthorizedPersonnel());
    }
  };
  
  // Get appropriate icon for role
  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "tte":
        return <Badge variant="outline" className="text-blue-500 border-blue-500">TTE</Badge>;
      case "security":
        return <Badge variant="outline" className="text-purple-500 border-purple-500">Security</Badge>;
      case "passenger":
      default:
        return <Badge variant="outline">Passenger</Badge>;
    }
  };

  return (
    <Card className="bg-card/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Fingerprint className="h-5 w-5 mr-2 text-primary" />
          Authorized Personnel Manager
        </CardTitle>
        <CardDescription>
          Manage individuals authorized to enter train coaches
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Add Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search personnel..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Person</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Authorized Person</DialogTitle>
                <DialogDescription>
                  Add a new person to the authorized personnel database
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newPersonRole}
                    onValueChange={setNewPersonRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passenger">Passenger</SelectItem>
                      <SelectItem value="tte">Train Ticket Examiner</SelectItem>
                      <SelectItem value="security">Security Personnel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newPersonRole === "passenger" && (
                  <div className="space-y-2">
                    <Label htmlFor="ticketId">Ticket ID</Label>
                    <Input
                      id="ticketId"
                      placeholder="Enter ticket ID"
                      value={newPersonTicketId}
                      onChange={(e) => setNewPersonTicketId(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> In a real implementation, this would include capturing 
                    the person's face image for enrollment in the facial recognition system.
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleAddPerson} disabled={!newPersonName}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Person
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Personnel List */}
        <div className="border rounded-md">
          <div className="p-2 border-b bg-muted/30 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <UserCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Authorized Personnel</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {filteredPersonnel.length} {filteredPersonnel.length === 1 ? 'person' : 'people'}
            </span>
          </div>
          
          <ScrollArea className="h-[300px]">
            {filteredPersonnel.length > 0 ? (
              <div className="divide-y">
                {filteredPersonnel.map((person) => (
                  <div key={person.faceId} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleIcon(person.role)}
                          {person.ticketId && (
                            <span className="text-xs text-muted-foreground">
                              Ticket: {person.ticketId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePerson(person.faceId)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? "No matching personnel found" : "No authorized personnel added yet"}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
} 