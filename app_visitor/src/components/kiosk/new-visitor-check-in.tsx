import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  CheckInWorkflow,
  type SecuritySettings,
  type VisitorData,
} from "./check-in-workflow";

interface NewVisitorCheckInProps {
  onComplete: () => void;
  securitySettings?: SecuritySettings;
}

export function NewVisitorCheckIn({
  onComplete,
  securitySettings = {
    requirePhoto: true,
    requireNDA: false,
    enableOtpVerification: false,
    hostApproval: false,
    guardApproval: true,
  },
}: NewVisitorCheckInProps) {
  const [step, setStep] = useState<"form" | "workflow">("form");
  const [visitorData, setVisitorData] = useState<VisitorData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    hostName: "",
    purpose: "",
  });

  // Mock company data
  const companies = [
    { name: "Acme Inc.", hosts: ["John Smith", "Jane Doe"] },
    { name: "Tech Solutions", hosts: ["Robert Johnson", "Emily Davis"] },
    { name: "Global Logistics", hosts: ["Michael Brown", "Sarah Wilson"] },
    { name: "Design Studio", hosts: ["David Miller", "Lisa Garcia"] },
  ];

  // Find hosts for selected company
  const getHostsForCompany = (companyName: string) => {
    const company = companies.find((c) => c.name === companyName);
    return company ? company.hosts : [];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVisitorData({
      ...visitorData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setVisitorData({
      ...visitorData,
      [name]: value,
    });
  };

  const handleStartCheckIn = () => {
    // Validate form
    if (
      !visitorData.name ||
      !visitorData.email ||
      !visitorData.company ||
      !visitorData.hostName ||
      !visitorData.purpose
    ) {
      toast("Missing information-Please fill in all required fields.");
      return;
    }

    // Start the check-in workflow
    setStep("workflow");
  };

  const handleWorkflowComplete = (finalVisitorData: VisitorData) => {
    // Check-in workflow completed
    onComplete();
  };

  const handleCancel = () => {
    if (step === "workflow") {
      // Go back to the form
      setStep("form");
    } else {
      // Cancel the entire check-in
      onComplete();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {step === "form" ? (
        <>
          <CardHeader>
            <CardTitle>Visitor Information</CardTitle>
            <CardDescription>Please enter your details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={visitorData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={visitorData.email}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={visitorData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select
                name="company"
                onValueChange={(value) => handleSelectChange("company", value)}
                value={visitorData.company}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.name} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {visitorData.company && (
              <div className="space-y-2">
                <Label htmlFor="hostName">Who are you here to see?</Label>
                <Select
                  name="hostName"
                  onValueChange={(value) =>
                    handleSelectChange("hostName", value)
                  }
                  value={visitorData.hostName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a host" />
                  </SelectTrigger>
                  <SelectContent>
                    {getHostsForCompany(visitorData.company).map((host) => (
                      <SelectItem key={host} value={host}>
                        {host}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Visit</Label>
              <Select
                name="purpose"
                onValueChange={(value) => handleSelectChange("purpose", value)}
                value={visitorData.purpose}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                  <SelectItem value="Site Tour">Site Tour</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {securitySettings.guardApproval && (
              <Alert className="mt-4 bg-orange-50 border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <AlertTitle>Guard Approval Required</AlertTitle>
                <AlertDescription>
                  Your check-in will need to be approved by a security guard
                  before you can proceed.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleStartCheckIn}>Continue</Button>
          </CardFooter>
        </>
      ) : (
        <CheckInWorkflow
          visitorData={visitorData}
          securitySettings={securitySettings}
          onComplete={handleWorkflowComplete}
          onCancel={handleCancel}
          isNewVisitor={true}
        />
      )}
    </Card>
  );
}
