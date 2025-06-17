"use client";

import { useState, useEffect } from "react";
// import { WebcamCapture } from "./webcam-capture"
import { OtpVerification } from "./otp-verification";
// import { HostApproval } from "./host-approval"
import { BadgeDisplay } from "./badge-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export interface SecuritySettings {
  requirePhoto: boolean;
  enableOtpVerification: boolean;
  requireNDA: boolean;
  hostApproval: boolean;
  guardApproval: boolean;
}

export interface VisitorData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  hostName: string;
  purpose: string;
  photo?: string;
  agreedToTerms?: boolean;
  preRegistered?: boolean;
}

interface CheckInWorkflowProps {
  visitorData: VisitorData;
  securitySettings: SecuritySettings;
  onComplete: (finalVisitorData: VisitorData) => void;
  onCancel: () => void;
  isNewVisitor?: boolean;
}

// Steps in the check-in workflow
export const CheckInStep = {
  PHOTO: "photo",
  OTP: "otp",
  NDA: "nda",
  HOST_APPROVAL: "host_approval",
  GUARD_PENDING: "guard_pending",
  COMPLETE: "complete",
  REJECTED: "rejected",
} as const;

export type CheckInStep = (typeof CheckInStep)[keyof typeof CheckInStep];

export function CheckInWorkflow({
  visitorData,
  securitySettings,
  onComplete,
  onCancel,
  isNewVisitor = true,
}: CheckInWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<CheckInStep | null>(null);
  const [steps, setSteps] = useState<CheckInStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [updatedVisitorData, setUpdatedVisitorData] =
    useState<VisitorData>(visitorData);
  const [isLoading, setIsLoading] = useState(false);
  const [guardRejectionReason, setGuardRejectionReason] = useState("");
  const [guardApprovalStatus, setGuardApprovalStatus] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [guardApprovalCheckInterval, setGuardApprovalCheckInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Determine the workflow steps based on security settings
  useEffect(() => {
    const workflowSteps: CheckInStep[] = [];

    // Add steps based on security settings
    // if (securitySettings.requirePhoto) {
    //   workflowSteps.push(CheckInStep.PHOTO);
    // }

    // if (securitySettings.enableOtpVerification) {
    //   workflowSteps.push(CheckInStep.OTP);
    // }

    // if (securitySettings.requireNDA) {
    //   workflowSteps.push(CheckInStep.NDA);
    // }

    // // Host approval only for new visitors
    // if (securitySettings.hostApproval && isNewVisitor) {
    //   workflowSteps.push(CheckInStep.HOST_APPROVAL);
    // }

    // Guard approval is the last step before completion
    if (securitySettings.guardApproval) {
      workflowSteps.push(CheckInStep.GUARD_PENDING);
    }

    // Always add complete step
    workflowSteps.push(CheckInStep.COMPLETE);

    setSteps(workflowSteps);
    setCurrentStep(
      workflowSteps.length > 0 ? workflowSteps[0] : CheckInStep.COMPLETE
    );

    console.log("Workflow steps:", workflowSteps);
  }, [securitySettings, isNewVisitor]);

  // Move to the next step in the workflow
  const moveToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setCurrentStep(steps[nextIndex]);
    } else {
      // We've reached the end of the workflow
      onComplete(updatedVisitorData);
    }
  };

  // Handle photo capture
  const handlePhotoCapture = (photoDataUrl: string) => {
    setUpdatedVisitorData({
      ...updatedVisitorData,
      photo: photoDataUrl,
    });
    moveToNextStep();
  };

  // Handle OTP verification
  const handleOtpVerified = () => {
    moveToNextStep();
  };

  // Handle NDA agreement
  const handleNdaAgreement = (agreed: boolean) => {
    setUpdatedVisitorData({
      ...updatedVisitorData,
      agreedToTerms: agreed,
    });

    if (agreed) {
      moveToNextStep();
    } else {
      toast("Agreement Required-You must agree to the terms to continue.");
    }
  };

  // Handle host approval
  const handleHostApproved = () => {
    moveToNextStep();
  };

  const handleHostRejected = () => {
    // If host rejects, we end the workflow
    onCancel();
  };

  // Add visitor to logs with appropriate status
  const addVisitorToLogs = (
    status: "pending-guard" | "checked-in" | "rejected"
  ) => {
    try {
      // Get current site ID from localStorage
      const siteId = localStorage.getItem("last-selected-site") || "hq";

      // Get existing visitor logs
      const existingLogs = localStorage.getItem("visitor-logs")
        ? JSON.parse(localStorage.getItem("visitor-logs") || "[]")
        : [];

      // Create new log entry
      const newLog = {
        id: updatedVisitorData.id || `visit-${Date.now()}`,
        name: updatedVisitorData.name,
        email: updatedVisitorData.email,
        phone: updatedVisitorData.phone || "",
        company: updatedVisitorData.company,
        host: updatedVisitorData.hostName,
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
        status: status,
        purpose: updatedVisitorData.purpose,
        photo:
          updatedVisitorData.photo ||
          `/placeholder.svg?height=40&width=40&query=${updatedVisitorData.name.charAt(
            0
          )}`,
        siteId: siteId,
        visitDate: new Date().toISOString().split("T")[0],
        preRegistered: updatedVisitorData.preRegistered || false,
        rejectionReason:
          status === "rejected" ? guardRejectionReason : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Only add to logs if NOT pending guard approval
      if (status !== "pending-guard") {
        // Add new log to existing logs
        const updatedLogs = [newLog, ...existingLogs];
        // Save updated logs
        localStorage.setItem("visitor-logs", JSON.stringify(updatedLogs));
      }

      // Store pending guard approvals separately
      if (status === "pending-guard") {
        const pendingApprovals = localStorage.getItem("pending-guard-approvals")
          ? JSON.parse(localStorage.getItem("pending-guard-approvals") || "[]")
          : [];

        const updatedPending = [newLog, ...pendingApprovals];
        localStorage.setItem(
          "pending-guard-approvals",
          JSON.stringify(updatedPending)
        );
      }

      // Dispatch event to notify other components
      window.dispatchEvent(new Event("visitorLogsUpdated"));

      return newLog;
    } catch (error) {
      console.error("Error updating visitor logs:", error);
      return null;
    }
  };

  // Submit visitor for guard approval
  const submitForGuardApproval = () => {
    setIsLoading(true);

    try {
      // Get current site ID from localStorage
      const siteId = localStorage.getItem("last-selected-site") || "hq";

      // Create visitor entry
      const visitorEntry = {
        id: updatedVisitorData.id || `visit-${Date.now()}`,
        name: updatedVisitorData.name,
        email: updatedVisitorData.email,
        phone: updatedVisitorData.phone || "",
        company: updatedVisitorData.company,
        host: updatedVisitorData.hostName,
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
        status: "pending-guard",
        purpose: updatedVisitorData.purpose,
        photo:
          updatedVisitorData.photo ||
          `/placeholder.svg?height=40&width=40&query=${updatedVisitorData.name.charAt(
            0
          )}`,
        siteId: siteId,
        visitDate: new Date().toISOString().split("T")[0],
        preRegistered: updatedVisitorData.preRegistered || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store pending guard approvals separately
      const pendingApprovals = localStorage.getItem("pending-guard-approvals")
        ? JSON.parse(localStorage.getItem("pending-guard-approvals") || "[]")
        : [];

      const updatedPending = [visitorEntry, ...pendingApprovals];
      localStorage.setItem(
        "pending-guard-approvals",
        JSON.stringify(updatedPending)
      );

      // Store the visitor ID for checking approval status
      setUpdatedVisitorData({
        ...updatedVisitorData,
        id: visitorEntry.id,
      });

      // Set up interval to check for guard approval
      const interval = setInterval(() => {
        checkGuardApprovalStatus(visitorEntry.id);
      }, 5000); // Check every 5 seconds

      setGuardApprovalCheckInterval(interval);
      setIsLoading(false);

      // Dispatch event to notify other components
      window.dispatchEvent(new Event("visitorLogsUpdated"));
    } catch (error) {
      console.error("Error submitting for guard approval:", error);
      toast("Error - Failed to submit for guard approval. Please try again.");
      setIsLoading(false);
    }
  };

  // Check if guard has approved or rejected the visitor
  const checkGuardApprovalStatus = (visitorId: string) => {
    try {
      // Check in visitor logs for approved/rejected status
      const logs = localStorage.getItem("visitor-logs")
        ? JSON.parse(localStorage.getItem("visitor-logs") || "[]")
        : [];

      // Find the visitor in logs
      const visitor = logs.find((log: any) => log.id === visitorId);

      if (visitor) {
        if (visitor.status === "checked-in") {
          // Guard approved
          setGuardApprovalStatus("approved");
          if (guardApprovalCheckInterval) {
            clearInterval(guardApprovalCheckInterval);
          }
          moveToNextStep();
        } else if (visitor.status === "rejected") {
          // Guard rejected
          setGuardApprovalStatus("rejected");
          setGuardRejectionReason(
            visitor.rejectionReason || "No reason provided"
          );
          if (guardApprovalCheckInterval) {
            clearInterval(guardApprovalCheckInterval);
          }
          setCurrentStep(CheckInStep.REJECTED);
        }
      }
    } catch (error) {
      console.error("Error checking guard approval status:", error);
    }
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (guardApprovalCheckInterval) {
        clearInterval(guardApprovalCheckInterval);
      }
    };
  }, [guardApprovalCheckInterval]);

  // Handle guard pending step
  useEffect(() => {
    if (
      currentStep === CheckInStep.GUARD_PENDING &&
      guardApprovalStatus === "pending"
    ) {
      submitForGuardApproval();
    }
  }, [currentStep, guardApprovalStatus]);

  // Calculate progress percentage
  const progressPercentage =
    steps.length > 0
      ? Math.round(((currentStepIndex + 1) / steps.length) * 100)
      : 100;

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      // case CheckInStep.PHOTO:
      //   return (
      //     <WebcamCapture
      //       onPhotoCapture={handlePhotoCapture}
      //       onCancel={onCancel}
      //       isFacialRecognition={false}
      //     />
      //   );

      case CheckInStep.OTP:
        return (
          <OtpVerification
            phoneNumber={updatedVisitorData.phone || "+1 (555) 123-4567"}
            onVerified={handleOtpVerified}
            onCancel={() => setCurrentStepIndex(currentStepIndex - 1)}
          />
        );

      case CheckInStep.NDA:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Non-Disclosure Agreement</CardTitle>
              <CardDescription>
                Please review and accept our terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4 h-48 overflow-y-auto text-sm">
                <p className="mb-4">
                  By checking in, you agree to comply with all site policies and
                  procedures during your visit. This includes safety protocols,
                  confidentiality requirements, and visitor conduct guidelines.
                </p>
                <p className="mb-4">
                  Your personal information will be processed in accordance with
                  our privacy policy for the purpose of managing your visit and
                  ensuring site security.
                </p>
                <p className="mb-4">
                  You acknowledge that you may be required to wear a visitor
                  badge at all times while on the premises and must be
                  accompanied by your host or authorized personnel.
                </p>
                <p>
                  In case of emergency, you agree to follow all instructions
                  from staff and emergency personnel.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreedToTerms"
                  checked={updatedVisitorData.agreedToTerms || false}
                  onCheckedChange={(checked) =>
                    handleNdaAgreement(checked as boolean)
                  }
                />
                <Label htmlFor="agreedToTerms">
                  I agree to the terms and conditions
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
              >
                Back
              </Button>
              <Button
                onClick={() => handleNdaAgreement(true)}
                disabled={!updatedVisitorData.agreedToTerms}
              >
                Continue
              </Button>
            </CardFooter>
          </Card>
        );

      // case CheckInStep.HOST_APPROVAL:
      //   return (
      //     <HostApproval
      //       visitorName={updatedVisitorData.name}
      //       hostName={updatedVisitorData.hostName}
      //       purpose={updatedVisitorData.purpose}
      //       onApproved={handleHostApproved}
      //       onRejected={handleHostRejected}
      //     />
      //   );

      case CheckInStep.GUARD_PENDING:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Guard Approval Required</CardTitle>
              <CardDescription>
                Your check-in is pending approval from a security guard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 text-amber-500 animate-spin" />
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Waiting for Guard Approval</AlertTitle>
                <AlertDescription>
                  Your check-in has been submitted and is pending approval from
                  a security guard. Please wait for the guard to approve your
                  visit.
                </AlertDescription>
              </Alert>

              <div className="rounded-lg border p-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Visitor
                    </p>
                    <p className="font-medium">{updatedVisitorData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Host
                    </p>
                    <p className="font-medium">{updatedVisitorData.hostName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Purpose
                    </p>
                    <p className="font-medium">{updatedVisitorData.purpose}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={onCancel}>
                Cancel Check-in
              </Button>
            </CardFooter>
          </Card>
        );

      case CheckInStep.REJECTED:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">
                Check-in Rejected
              </CardTitle>
              <CardDescription>
                Your check-in has been rejected by the security guard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  Your check-in request has been rejected. Please contact the
                  front desk for assistance.
                </AlertDescription>
              </Alert>

              {guardRejectionReason && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
                  <p className="font-medium mb-1">Reason for rejection:</p>
                  <p className="text-sm">{guardRejectionReason}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={onCancel}>Return to Start</Button>
            </CardFooter>
          </Card>
        );

      case CheckInStep.COMPLETE:
        // If guard approval was required, the visitor is already in logs
        // If no guard approval required, add to logs as checked-in
        if (!securitySettings.guardApproval) {
          addVisitorToLogs("checked-in");
        }

        return (
          <Card>
            <CardHeader>
              <CardTitle>Check-in Complete</CardTitle>
              <CardDescription>Your visitor badge is ready</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>

              <BadgeDisplay
                name={updatedVisitorData.name}
                company={updatedVisitorData.company}
                hostName={updatedVisitorData.hostName}
                photo={updatedVisitorData.photo}
                isMultiDay={false}
              />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => onComplete(updatedVisitorData)}>
                Finish
              </Button>
            </CardFooter>
          </Card>
        );

      default:
        return (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Check-in Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Current step */}
      {renderStep()}
    </div>
  );
}
