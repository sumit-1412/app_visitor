import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Printer, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface BadgeDisplayProps {
  visitorName?: string;
  name?: string; // Add this to handle both prop naming conventions
  visitorCompany?: string;
  company?: string; // Add this to handle both prop naming conventions
  hostName: string;
  photoUrl?: string | null;
  photo?: string | null; // Add this to handle both prop naming conventions
  showQrCode?: boolean;
  startDate?: Date;
  endDate?: Date | null;
  isMultiDay?: boolean;
  onReset?: () => void;
}

export function BadgeDisplay({
  visitorName,
  name, // Accept both prop naming conventions
  visitorCompany,
  company, // Accept both prop naming conventions
  hostName,
  photoUrl,
  photo, // Accept both prop naming conventions
  showQrCode = true,
  startDate,
  endDate,
  isMultiDay = false,
  onReset,
}: BadgeDisplayProps) {
  const badgeRef = useRef<HTMLDivElement>(null);

  // Use the appropriate prop, with fallbacks
  const displayName = visitorName || name || "";
  const displayCompany = visitorCompany || company || "";
  const displayPhoto = photoUrl || photo || null;

  const handlePrint = () => {
    window.print();
  };

  // Generate a unique visitor ID for the QR code
  const visitorId = Math.random().toString(36).substring(2, 10).toUpperCase();

  // Format the date display
  const formatDateDisplay = () => {
    if (isMultiDay && startDate && endDate) {
      return `${format(startDate, "MMM d")} - ${format(
        endDate,
        "MMM d, yyyy"
      )}`;
    }
    return new Date().toLocaleDateString();
  };

  // Generate initials safely
  const getInitials = (fullName: string) => {
    if (!fullName) return "VT";
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="text-center">
        <div className="mb-2 flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Check-In Complete!</h2>
        <p className="text-muted-foreground">Your visitor badge is ready</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-2 sm:px-0">
        <Card className="w-full max-w-md border-2 border-primary/20 p-1">
          <CardContent className="p-2 sm:p-4" ref={badgeRef}>
            <div className="flex flex-col items-center space-y-2 sm:space-y-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-md bg-primary">
                  <span className="text-base sm:text-lg font-bold text-primary-foreground">
                    VT
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold">VISITOR</h3>
                {isMultiDay && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-primary/10 text-xs sm:text-sm"
                  >
                    Multi-Day
                  </Badge>
                )}
              </div>

              <div className="grid w-full grid-cols-3 gap-2 sm:gap-4">
                <div className="col-span-2 space-y-1 sm:space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      NAME
                    </p>
                    <p className="text-base sm:text-lg font-bold truncate">
                      {displayName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      COMPANY
                    </p>
                    <p className="text-sm sm:text-base truncate">
                      {displayCompany}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      HOST
                    </p>
                    <p className="text-sm sm:text-base truncate">{hostName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      DATE
                    </p>
                    <p className="text-sm sm:text-base">
                      {formatDateDisplay()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-between">
                  {displayPhoto ? (
                    <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-md border">
                      <img
                        src={displayPhoto || "/placeholder.svg"}
                        alt="Visitor"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-md border bg-muted">
                      <span className="text-xl sm:text-2xl font-bold text-muted-foreground">
                        {getInitials(displayName)}
                      </span>
                    </div>
                  )}
                  {showQrCode && (
                    <div className="mt-2">
                      <QRCodeSVG
                        value={`VISITOR:${visitorId}`}
                        size={70}
                        className="sm:hidden"
                      />
                      <QRCodeSVG
                        value={`VISITOR:${visitorId}`}
                        size={80}
                        className="hidden sm:block"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full rounded-md bg-muted p-2 text-center text-xs sm:text-sm">
                <p>Visitor ID: {visitorId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {onReset && (
        <div className="mt-auto flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="lg"
            className="w-full text-base sm:text-lg"
            onClick={onReset}
          >
            <RefreshCw className="mr-2 h-4 w-5" /> New Check-In
          </Button>
          <Button
            size="lg"
            className="w-full text-base sm:text-lg"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-5" /> Print Badge
          </Button>
        </div>
      )}
    </div>
  );
}
