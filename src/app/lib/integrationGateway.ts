/**
 * Integration Gateway
 * Abstraction layer for all external vendor integrations
 * 
 * This layer manages connections to external services (EVV, SMS, fax, etc.)
 * All integration operations are logged to the database for audit purposes.
 * 
 * Pattern: All vendor integrations go through this gateway.
 * UI components should NEVER call vendor APIs directly.
 */

import { auditGateway, configGateway } from './dataGateway';

// ============================================================================
// TYPES - Integration Models
// ============================================================================

export interface IntegrationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  vendorResponse?: any;
  logId?: string; // Reference to audit log entry
}

export interface EVVClockIn {
  visitId: string;
  clinicianId: string;
  patientId: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
}

export interface EVVClockOut {
  visitId: string;
  clinicianId: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  taskIds?: string[];
}

export interface EVVVerification {
  visitId: string;
  status: 'verified' | 'exception' | 'pending';
  clockInTime?: string;
  clockOutTime?: string;
  totalMinutes?: number;
  exception?: string;
  vendorData?: any;
}

export interface SMSMessage {
  to: string;
  from?: string;
  message: string;
  patientId?: string;
  visitId?: string;
}

export interface SMSResult {
  messageId: string;
  status: 'sent' | 'failed' | 'queued';
  timestamp: string;
}

export interface FaxDocument {
  to: string;
  from?: string;
  documentUrl: string;
  documentName: string;
  patientId?: string;
  coverPageNote?: string;
}

export interface FaxResult {
  faxId: string;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  timestamp: string;
}

export interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  from?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  contentType: string;
}

export interface EmailResult {
  messageId: string;
  status: 'sent' | 'failed' | 'queued';
  timestamp: string;
}

export interface MedicationVerification {
  patientId: string;
  medications: string[];
}

export interface MedicationResult {
  patientId: string;
  medications: Array<{
    name: string;
    verified: boolean;
    conflicts?: string[];
    interactions?: string[];
  }>;
}

// ============================================================================
// EVV INTEGRATION
// ============================================================================

export const evvGateway = {
  /**
   * Clock in to a visit
   */
  async clockIn(clockIn: EVVClockIn, userId: string): Promise<IntegrationResult<EVVVerification>> {
    try {
      // Log the integration attempt
      const auditLog = await auditGateway.log({
        userId,
        action: 'evv_clock_in',
        entityType: 'visit',
        entityId: clockIn.visitId,
        changes: { clockIn },
      });

      // TODO: Replace with actual EVV vendor API call
      // Get vendor config
      // const configs = await configGateway.getVendorConfigs('org-1');
      // const evvConfig = configs.find(c => c.vendorType === 'evv' && c.enabled);
      
      // Mock implementation
      const mockResult: EVVVerification = {
        visitId: clockIn.visitId,
        status: 'verified',
        clockInTime: clockIn.timestamp,
        vendorData: {
          transactionId: `evv-${Date.now()}`,
        },
      };

      return {
        success: true,
        data: mockResult,
        logId: auditLog.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'EVV clock in failed',
      };
    }
  },

  /**
   * Clock out from a visit
   */
  async clockOut(clockOut: EVVClockOut, userId: string): Promise<IntegrationResult<EVVVerification>> {
    try {
      // Log the integration attempt
      const auditLog = await auditGateway.log({
        userId,
        action: 'evv_clock_out',
        entityType: 'visit',
        entityId: clockOut.visitId,
        changes: { clockOut },
      });

      // TODO: Replace with actual EVV vendor API call
      
      // Mock implementation
      const mockResult: EVVVerification = {
        visitId: clockOut.visitId,
        status: 'verified',
        clockOutTime: clockOut.timestamp,
        totalMinutes: 60,
        vendorData: {
          transactionId: `evv-${Date.now()}`,
        },
      };

      return {
        success: true,
        data: mockResult,
        logId: auditLog.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'EVV clock out failed',
      };
    }
  },

  /**
   * Get EVV verification status for a visit
   */
  async getVerificationStatus(visitId: string): Promise<IntegrationResult<EVVVerification>> {
    try {
      // TODO: Replace with actual EVV vendor API call
      
      // Mock implementation
      const mockResult: EVVVerification = {
        visitId,
        status: 'verified',
        clockInTime: new Date().toISOString(),
        clockOutTime: new Date().toISOString(),
        totalMinutes: 60,
      };

      return {
        success: true,
        data: mockResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get EVV status',
      };
    }
  },
};

// ============================================================================
// SMS INTEGRATION
// ============================================================================

export const smsGateway = {
  /**
   * Send SMS message
   */
  async send(message: SMSMessage, userId: string): Promise<IntegrationResult<SMSResult>> {
    try {
      // Log the integration attempt
      const auditLog = await auditGateway.log({
        userId,
        action: 'sms_send',
        entityType: message.patientId ? 'patient' : 'general',
        entityId: message.patientId || 'n/a',
        changes: {
          to: message.to,
          message: message.message.substring(0, 50) + '...', // Don't log full message for privacy
        },
      });

      // TODO: Replace with actual SMS vendor API call
      // Get vendor config
      // const configs = await configGateway.getVendorConfigs('org-1');
      // const smsConfig = configs.find(c => c.vendorType === 'sms' && c.enabled);
      
      // Mock implementation
      const mockResult: SMSResult = {
        messageId: `sms-${Date.now()}`,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: mockResult,
        logId: auditLog.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMS send failed',
      };
    }
  },

  /**
   * Get SMS delivery status
   */
  async getStatus(messageId: string): Promise<IntegrationResult<SMSResult>> {
    try {
      // TODO: Replace with actual SMS vendor API call
      
      // Mock implementation
      const mockResult: SMSResult = {
        messageId,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: mockResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get SMS status',
      };
    }
  },
};

// ============================================================================
// FAX INTEGRATION
// ============================================================================

export const faxGateway = {
  /**
   * Send fax
   */
  async send(fax: FaxDocument, userId: string): Promise<IntegrationResult<FaxResult>> {
    try {
      // Log the integration attempt
      const auditLog = await auditGateway.log({
        userId,
        action: 'fax_send',
        entityType: fax.patientId ? 'patient' : 'general',
        entityId: fax.patientId || 'n/a',
        changes: {
          to: fax.to,
          documentName: fax.documentName,
        },
      });

      // TODO: Replace with actual fax vendor API call
      // Get vendor config
      // const configs = await configGateway.getVendorConfigs('org-1');
      // const faxConfig = configs.find(c => c.vendorType === 'fax' && c.enabled);
      
      // Mock implementation
      const mockResult: FaxResult = {
        faxId: `fax-${Date.now()}`,
        status: 'queued',
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: mockResult,
        logId: auditLog.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fax send failed',
      };
    }
  },

  /**
   * Get fax delivery status
   */
  async getStatus(faxId: string): Promise<IntegrationResult<FaxResult>> {
    try {
      // TODO: Replace with actual fax vendor API call
      
      // Mock implementation
      const mockResult: FaxResult = {
        faxId,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: mockResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get fax status',
      };
    }
  },
};

// ============================================================================
// EMAIL INTEGRATION
// ============================================================================

export const emailGateway = {
  /**
   * Send email
   */
  async send(email: EmailMessage, userId: string): Promise<IntegrationResult<EmailResult>> {
    try {
      // Log the integration attempt
      const auditLog = await auditGateway.log({
        userId,
        action: 'email_send',
        entityType: 'general',
        entityId: 'n/a',
        changes: {
          to: email.to,
          subject: email.subject,
        },
      });

      // TODO: Replace with actual email vendor API call
      // Get vendor config
      // const configs = await configGateway.getVendorConfigs('org-1');
      // const emailConfig = configs.find(c => c.vendorType === 'email' && c.enabled);
      
      // Mock implementation
      const mockResult: EmailResult = {
        messageId: `email-${Date.now()}`,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: mockResult,
        logId: auditLog.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email send failed',
      };
    }
  },

  /**
   * Get email delivery status
   */
  async getStatus(messageId: string): Promise<IntegrationResult<EmailResult>> {
    try {
      // TODO: Replace with actual email vendor API call
      
      // Mock implementation
      const mockResult: EmailResult = {
        messageId,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        data: mockResult,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get email status',
      };
    }
  },
};

// ============================================================================
// MEDICATION SERVICE INTEGRATION
// ============================================================================

export const medicationGateway = {
  /**
   * Verify medications for interactions and conflicts
   */
  async verify(verification: MedicationVerification, userId: string): Promise<IntegrationResult<MedicationResult>> {
    try {
      // Log the integration attempt
      const auditLog = await auditGateway.log({
        userId,
        action: 'medication_verify',
        entityType: 'patient',
        entityId: verification.patientId,
        changes: {
          medications: verification.medications,
        },
      });

      // TODO: Replace with actual medication service API call
      
      // Mock implementation
      const mockResult: MedicationResult = {
        patientId: verification.patientId,
        medications: verification.medications.map((med) => ({
          name: med,
          verified: true,
          conflicts: [],
          interactions: [],
        })),
      };

      return {
        success: true,
        data: mockResult,
        logId: auditLog.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Medication verification failed',
      };
    }
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Test vendor connection
 */
export async function testVendorConnection(
  vendorType: 'evv' | 'sms' | 'fax' | 'email' | 'medication',
  vendorId: string
): Promise<IntegrationResult<{ connected: boolean }>> {
  try {
    // TODO: Implement actual connection test based on vendor type
    
    // Mock implementation
    return {
      success: true,
      data: {
        connected: true,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    };
  }
}

// ============================================================================
// MIGRATION NOTES FOR .NET 8 API
// ============================================================================

/*
When migrating to .NET 8 API:

1. The integration gateway can remain mostly unchanged
2. Update vendor API calls to route through .NET middleware:
   
   Example:
   async send(message: SMSMessage, userId: string): Promise<IntegrationResult<SMSResult>> {
     const response = await fetch(`${API_BASE_URL}/api/integrations/sms/send`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${getAccessToken()}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ message, userId }),
     });
     
     if (!response.ok) {
       return {
         success: false,
         error: `Failed to send SMS: ${response.statusText}`,
       };
     }
     
     const data = await response.json();
     return {
       success: true,
       data,
     };
   }

3. .NET API will handle:
   - Vendor credential management
   - Retry logic
   - Rate limiting
   - Audit logging (though we log on client side too)
   - Error handling and transformation

4. Keep all integration types and interfaces unchanged
5. UI components remain unchanged - they only call gateway methods
*/
