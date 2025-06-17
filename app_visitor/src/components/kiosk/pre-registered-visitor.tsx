"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Search, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckInWorkflow,
  type SecuritySettings,
  type VisitorData,
} from "./check-in-workflow";

const formSchema = z.object({
  identifier: z
    .string()
    .min(5, { message: "Please enter a valid email or phone number." }),
});

// Mock pre-registered visitor data
const mockVisitor: VisitorData = {
  name: "Emily Davis",
  email: "emily.davis@example.com",
  phone: "+1 (555) 987-6543",
  company: "Tech Solutions Inc.",
  hostName: "Michael Brown",
  purpose: "Interview",
  preRegistered: true,
};

interface PreRegisteredVisitorProps {
  onComplete: () => void;
  securitySettings?: SecuritySettings;
}

export function PreRegisteredVisitor({
  onComplete,
  securitySettings = {
    requirePhoto: true,
    requireNDA: false,
    enableOtpVerification: false,
    hostApproval: false,
    guardApproval: true,
  },
}: PreRegisteredVisitorProps) {
  const [step, setStep] = useState<"lookup" | "confirm" | "workflow">("lookup");
  const [isLoading, setIsLoading] = useState(false);
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API lookup
    setTimeout(() => {
      setIsLoading(false);
      setVisitorData(mockVisitor);
      setStep("confirm");
    }, 1500);
  }

  function handleConfirm() {
    setStep("workflow");
  }

  function handleCancel() {
    if (step === "workflow") {
      setStep("confirm");
    } else if (step === "confirm") {
      setStep("lookup");
      form.reset();
      setVisitorData(null);
    } else {
      onComplete();
    }
  }

  function handleWorkflowComplete(finalVisitorData: VisitorData) {
    // Check-in workflow completed
    onComplete();
  }

  return (
    <div className="flex flex-1 flex-col">
      {step === "lookup" && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col space-y-6"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">
                      Email or Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email or phone number"
                        className="h-12 text-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-sm text-muted-foreground">
                Enter the email or phone number you used during pre-registration
              </p>
              <p className="text-sm text-muted-foreground">
                For demo purposes, you can enter any valid email address
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-auto text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" /> Find Reservation
                </>
              )}
            </Button>
          </form>
        </Form>
      )}

      {step === "confirm" && visitorData && (
        <div className="flex flex-1 flex-col space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Welcome, {visitorData.name}</h2>
            <p className="text-muted-foreground">
              Please confirm your visit details:
            </p>

            <Card>
              <CardContent className="grid gap-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Name
                    </p>
                    <p className="text-lg">{visitorData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Company
                    </p>
                    <p className="text-lg">{visitorData.company}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Purpose
                    </p>
                    <p className="text-lg">{visitorData.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Host
                    </p>
                    <p className="text-lg">{visitorData.hostName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

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
          </div>

          <div className="mt-auto flex gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 text-lg"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1 text-lg"
              onClick={handleConfirm}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" /> Confirm & Continue
            </Button>
          </div>
        </div>
      )}

      {step === "workflow" && visitorData && (
        <CheckInWorkflow
          visitorData={visitorData}
          securitySettings={securitySettings}
          onComplete={handleWorkflowComplete}
          onCancel={handleCancel}
          isNewVisitor={false}
        />
      )}
    </div>
  );
}
