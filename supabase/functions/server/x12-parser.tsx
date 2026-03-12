/**
 * X12 EDI Parser - Healthcare Transactions
 * Supports: 270/271 (Eligibility), 837 (Claims), 276/277 (Claim Status), 835 (ERA)
 * HIPAA-compliant EDI parsing with robust error handling
 */

// ─── Types ─────────────────────────────────────────────────────────────────

export interface X12Segment {
  name: string;
  elements: string[];
}

export interface X12Interchange {
  isa: ISASegment;
  groups: X12FunctionalGroup[];
  iea: IEASegment;
}

export interface ISASegment {
  authInfoQualifier: string;
  authInfo: string;
  securityInfoQualifier: string;
  securityInfo: string;
  senderIdQualifier: string;
  senderId: string;
  receiverIdQualifier: string;
  receiverId: string;
  date: string;
  time: string;
  standardsId: string;
  version: string;
  controlNumber: string;
  ackRequested: string;
  usageIndicator: string;
  componentSeparator: string;
}

export interface IEASegment {
  groupCount: string;
  controlNumber: string;
}

export interface X12FunctionalGroup {
  gs: GSSegment;
  transactions: X12Transaction[];
  ge: GESegment;
}

export interface GSSegment {
  functionalIdCode: string;
  applicationSenderCode: string;
  applicationReceiverCode: string;
  date: string;
  time: string;
  groupControlNumber: string;
  responsibleAgencyCode: string;
  versionCode: string;
}

export interface GESegment {
  transactionSetCount: string;
  groupControlNumber: string;
}

export interface X12Transaction {
  st: STSegment;
  type: string;
  data: any;
  se: SESegment;
}

export interface STSegment {
  transactionSetId: string;
  controlNumber: string;
  implementationConventionRef?: string;
}

export interface SESegment {
  segmentCount: string;
  controlNumber: string;
}

// ─── 270 - Eligibility Inquiry ────────────────────────────────────────────

export interface X12_270_Request {
  transactionType: '270';
  controlNumber: string;
  provider: {
    npi: string;
    name: string;
    taxId?: string;
  };
  subscriber: {
    memberId: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender?: string;
  };
  payer: {
    payerId: string;
    name?: string;
  };
  serviceType?: string;
  serviceDate?: string;
}

// ─── 271 - Eligibility Response ───────────────────────────────────────────

export interface X12_271_Response {
  transactionType: '271';
  controlNumber: string;
  payer: {
    payerId: string;
    name: string;
  };
  subscriber: {
    memberId: string;
    firstName: string;
    lastName: string;
    eligibilityStatus: 'active' | 'inactive' | 'unknown';
  };
  coverage: {
    coverageLevel: string;
    serviceType: string;
    planName?: string;
    effectiveDate?: string;
    terminationDate?: string;
  }[];
  benefits: {
    code: string;
    serviceType: string;
    coverage: string;
    timePeriod?: string;
    amount?: number;
    percentage?: number;
    quantity?: number;
  }[];
  errors?: {
    code: string;
    description: string;
  }[];
}

// ─── 837 - Professional/Institutional Claim ───────────────────────────────

export interface X12_837_Claim {
  transactionType: '837';
  controlNumber: string;
  submitter: {
    organizationName: string;
    contactName: string;
    contactPhone: string;
    taxId: string;
  };
  receiver: {
    name: string;
  };
  billing: {
    npi: string;
    taxId: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  subscriber: {
    payerResponsibility: 'P' | 'S' | 'T';
    memberId: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: 'M' | 'F' | 'U';
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  patient?: {
    relationship: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: 'M' | 'F' | 'U';
  };
  payer: {
    payerId: string;
    name: string;
  };
  claim: {
    patientControlNumber: string;
    claimAmount: number;
    placeOfService: string;
    claimFrequency: string;
    providerSignature: boolean;
    planParticipation: boolean;
    benefitsAssignment: boolean;
    releaseInfo: boolean;
    principalDiagnosis: string;
    additionalDiagnoses?: string[];
    admissionDate?: string;
    dischargeDate?: string;
  };
  serviceLines: {
    lineNumber: string;
    procedureCode: string;
    modifiers?: string[];
    description?: string;
    chargeAmount: number;
    units: number;
    serviceDate: string;
    placeOfService: string;
    diagnosis?: string[];
  }[];
}

// ─── 276 - Claim Status Inquiry ───────────────────────────────────────────

export interface X12_276_Inquiry {
  transactionType: '276';
  controlNumber: string;
  provider: {
    npi: string;
    name: string;
  };
  payer: {
    payerId: string;
    name?: string;
  };
  claims: {
    patientControlNumber?: string;
    claimSubmitterIdentifier?: string;
    serviceDate?: string;
    amount?: number;
    patient: {
      firstName: string;
      lastName: string;
      dob?: string;
      memberId?: string;
    };
  }[];
}

// ─── 277 - Claim Status Response ──────────────────────────────────────────

export interface X12_277_Response {
  transactionType: '277';
  controlNumber: string;
  payer: {
    payerId: string;
    name: string;
  };
  claims: {
    patientControlNumber: string;
    claimStatus: string;
    claimStatusCategory: string;
    totalClaimCharge?: number;
    serviceDate?: string;
    patient: {
      firstName: string;
      lastName: string;
    };
    statusDetails: {
      entityCode: string;
      statusCode: string;
      statusCategoryCode: string;
      effectiveDate?: string;
      description?: string;
    }[];
  }[];
}

// ─── 835 - Electronic Remittance Advice (ERA) ─────────────────────────────

export interface X12_835_ERA {
  transactionType: '835';
  controlNumber: string;
  payer: {
    name: string;
    payerId: string;
    contactName?: string;
    contactPhone?: string;
  };
  payee: {
    npi: string;
    name: string;
    taxId: string;
  };
  payment: {
    paymentMethod: 'CHK' | 'ACH' | 'BOP' | 'NON';
    paymentAmount: number;
    creditDebitFlag: 'C' | 'D';
    paymentDate: string;
    checkNumber?: string;
    traceNumber?: string;
  };
  claims: {
    patientControlNumber: string;
    claimStatusCode: string;
    totalClaimCharge: number;
    claimPayment: number;
    patientResponsibility: number;
    patient: {
      firstName: string;
      lastName: string;
      memberId: string;
    };
    serviceLines: {
      procedureCode: string;
      modifiers?: string[];
      chargedAmount: number;
      paidAmount: number;
      units: number;
      serviceDate: string;
      adjustments: {
        groupCode: 'CO' | 'CR' | 'OA' | 'PI' | 'PR';
        reasonCode: string;
        amount: number;
        quantity?: number;
      }[];
    }[];
    claimAdjustments: {
      groupCode: 'CO' | 'CR' | 'OA' | 'PI' | 'PR';
      reasonCode: string;
      amount: number;
    }[];
  }[];
}

// ─── Parser Configuration ─────────────────────────────────────────────────

export interface X12ParserConfig {
  segmentTerminator?: string;
  elementSeparator?: string;
  componentSeparator?: string;
  strict?: boolean;
}

const DEFAULT_CONFIG: X12ParserConfig = {
  segmentTerminator: '~',
  elementSeparator: '*',
  componentSeparator: ':',
  strict: true,
};

// ─── Core Parser Functions ────────────────────────────────────────────────

export class X12Parser {
  private config: Required<X12ParserConfig>;

  constructor(config: X12ParserConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config } as Required<X12ParserConfig>;
  }

  /**
   * Parse raw X12 EDI string into structured format
   */
  parseRaw(ediContent: string): X12Interchange {
    // Normalize line endings and remove extra whitespace
    const normalized = ediContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

    // Auto-detect delimiters from ISA segment
    const isaMatch = normalized.match(/^ISA(.)/);
    if (!isaMatch) {
      throw new Error('Invalid X12 format: ISA segment not found');
    }

    const elementSeparator = isaMatch[1];
    const segmentTerminator = normalized.charAt(105) || this.config.segmentTerminator;
    const componentSeparator = normalized.charAt(104) || this.config.componentSeparator;

    this.config.elementSeparator = elementSeparator;
    this.config.segmentTerminator = segmentTerminator;
    this.config.componentSeparator = componentSeparator;

    // Split into segments
    const segments = normalized
      .split(segmentTerminator)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => this.parseSegment(s));

    return this.buildInterchange(segments);
  }

  /**
   * Parse individual segment into structured format
   */
  private parseSegment(segment: string): X12Segment {
    const elements = segment.split(this.config.elementSeparator);
    const name = elements[0];
    
    return {
      name,
      elements: elements.slice(1),
    };
  }

  /**
   * Build interchange structure from segments
   */
  private buildInterchange(segments: X12Segment[]): X12Interchange {
    const isaSegment = segments.find(s => s.name === 'ISA');
    const ieaSegment = segments.find(s => s.name === 'IEA');

    if (!isaSegment || !ieaSegment) {
      throw new Error('Invalid X12: Missing ISA or IEA segment');
    }

    const isa: ISASegment = {
      authInfoQualifier: isaSegment.elements[0],
      authInfo: isaSegment.elements[1],
      securityInfoQualifier: isaSegment.elements[2],
      securityInfo: isaSegment.elements[3],
      senderIdQualifier: isaSegment.elements[4],
      senderId: isaSegment.elements[5]?.trim(),
      receiverIdQualifier: isaSegment.elements[6],
      receiverId: isaSegment.elements[7]?.trim(),
      date: isaSegment.elements[8],
      time: isaSegment.elements[9],
      standardsId: isaSegment.elements[10],
      version: isaSegment.elements[11],
      controlNumber: isaSegment.elements[12],
      ackRequested: isaSegment.elements[13],
      usageIndicator: isaSegment.elements[14],
      componentSeparator: isaSegment.elements[15],
    };

    const iea: IEASegment = {
      groupCount: ieaSegment.elements[0],
      controlNumber: ieaSegment.elements[1],
    };

    const groups = this.buildFunctionalGroups(segments);

    return { isa, groups, iea };
  }

  /**
   * Build functional groups from segments
   */
  private buildFunctionalGroups(segments: X12Segment[]): X12FunctionalGroup[] {
    const groups: X12FunctionalGroup[] = [];
    let currentGroup: X12Segment[] | null = null;

    for (const segment of segments) {
      if (segment.name === 'GS') {
        currentGroup = [segment];
      } else if (segment.name === 'GE' && currentGroup) {
        currentGroup.push(segment);
        groups.push(this.parseFunctionalGroup(currentGroup));
        currentGroup = null;
      } else if (currentGroup && segment.name !== 'ISA' && segment.name !== 'IEA') {
        currentGroup.push(segment);
      }
    }

    return groups;
  }

  /**
   * Parse functional group
   */
  private parseFunctionalGroup(segments: X12Segment[]): X12FunctionalGroup {
    const gsSegment = segments[0];
    const geSegment = segments[segments.length - 1];

    const gs: GSSegment = {
      functionalIdCode: gsSegment.elements[0],
      applicationSenderCode: gsSegment.elements[1],
      applicationReceiverCode: gsSegment.elements[2],
      date: gsSegment.elements[3],
      time: gsSegment.elements[4],
      groupControlNumber: gsSegment.elements[5],
      responsibleAgencyCode: gsSegment.elements[6],
      versionCode: gsSegment.elements[7],
    };

    const ge: GESegment = {
      transactionSetCount: geSegment.elements[0],
      groupControlNumber: geSegment.elements[1],
    };

    const transactions = this.buildTransactions(segments.slice(1, -1));

    return { gs, transactions, ge };
  }

  /**
   * Build transaction sets from segments
   */
  private buildTransactions(segments: X12Segment[]): X12Transaction[] {
    const transactions: X12Transaction[] = [];
    let currentTransaction: X12Segment[] | null = null;

    for (const segment of segments) {
      if (segment.name === 'ST') {
        currentTransaction = [segment];
      } else if (segment.name === 'SE' && currentTransaction) {
        currentTransaction.push(segment);
        transactions.push(this.parseTransaction(currentTransaction));
        currentTransaction = null;
      } else if (currentTransaction) {
        currentTransaction.push(segment);
      }
    }

    return transactions;
  }

  /**
   * Parse transaction set
   */
  private parseTransaction(segments: X12Segment[]): X12Transaction {
    const stSegment = segments[0];
    const seSegment = segments[segments.length - 1];

    const st: STSegment = {
      transactionSetId: stSegment.elements[0],
      controlNumber: stSegment.elements[1],
      implementationConventionRef: stSegment.elements[2],
    };

    const se: SESegment = {
      segmentCount: seSegment.elements[0],
      controlNumber: seSegment.elements[1],
    };

    const transactionType = st.transactionSetId;
    let data: any = null;

    // Parse based on transaction type
    switch (transactionType) {
      case '270':
        data = this.parse270(segments);
        break;
      case '271':
        data = this.parse271(segments);
        break;
      case '837':
        data = this.parse837(segments);
        break;
      case '276':
        data = this.parse276(segments);
        break;
      case '277':
        data = this.parse277(segments);
        break;
      case '835':
        data = this.parse835(segments);
        break;
      default:
        data = { raw: segments };
    }

    return {
      st,
      type: transactionType,
      data,
      se,
    };
  }

  // ─── Transaction-Specific Parsers ──────────────────────────────────────

  /**
   * Parse 270 - Eligibility Inquiry
   */
  private parse270(segments: X12Segment[]): Partial<X12_270_Request> {
    const result: Partial<X12_270_Request> = {
      transactionType: '270',
      controlNumber: segments[0].elements[1],
    };

    let inLoop = '';
    
    for (const segment of segments) {
      // Identify loops
      if (segment.name === 'NM1') {
        const entityCode = segment.elements[0];
        if (entityCode === 'PR') inLoop = 'payer';
        else if (entityCode === '1P') inLoop = 'provider';
        else if (entityCode === 'IL') inLoop = 'subscriber';
      }

      // Parse payer
      if (inLoop === 'payer' && segment.name === 'NM1') {
        result.payer = {
          payerId: segment.elements[8] || '',
          name: segment.elements[2] || '',
        };
      }

      // Parse provider
      if (inLoop === 'provider' && segment.name === 'NM1') {
        result.provider = {
          npi: segment.elements[8] || '',
          name: `${segment.elements[2] || ''} ${segment.elements[3] || ''}`.trim(),
        };
      }

      // Parse subscriber
      if (inLoop === 'subscriber') {
        if (segment.name === 'NM1') {
          result.subscriber = {
            memberId: segment.elements[8] || '',
            firstName: segment.elements[3] || '',
            lastName: segment.elements[2] || '',
            dob: '',
          };
        }
        if (segment.name === 'DMG' && result.subscriber) {
          result.subscriber.dob = segment.elements[1] || '';
          result.subscriber.gender = segment.elements[2];
        }
      }

      // Service type
      if (segment.name === 'EQ') {
        result.serviceType = segment.elements[0];
      }

      // Service date
      if (segment.name === 'DTP' && segment.elements[0] === '291') {
        result.serviceDate = segment.elements[2];
      }
    }

    return result;
  }

  /**
   * Parse 271 - Eligibility Response
   */
  private parse271(segments: X12Segment[]): Partial<X12_271_Response> {
    const result: Partial<X12_271_Response> = {
      transactionType: '271',
      controlNumber: segments[0].elements[1],
      coverage: [],
      benefits: [],
      errors: [],
    };

    let inLoop = '';

    for (const segment of segments) {
      // Identify loops
      if (segment.name === 'NM1') {
        const entityCode = segment.elements[0];
        if (entityCode === 'PR') inLoop = 'payer';
        else if (entityCode === 'IL') inLoop = 'subscriber';
      }

      // Parse payer
      if (inLoop === 'payer' && segment.name === 'NM1') {
        result.payer = {
          payerId: segment.elements[8] || '',
          name: segment.elements[2] || '',
        };
      }

      // Parse subscriber
      if (inLoop === 'subscriber') {
        if (segment.name === 'NM1') {
          result.subscriber = {
            memberId: segment.elements[8] || '',
            firstName: segment.elements[3] || '',
            lastName: segment.elements[2] || '',
            eligibilityStatus: 'active',
          };
        }
      }

      // Parse benefits
      if (segment.name === 'EB') {
        const benefit = {
          code: segment.elements[0] || '',
          serviceType: segment.elements[3] || '',
          coverage: segment.elements[1] || '',
          timePeriod: segment.elements[6],
          percentage: segment.elements[7] ? parseFloat(segment.elements[7]) : undefined,
        };
        result.benefits!.push(benefit);
      }

      // Parse coverage dates
      if (segment.name === 'DTP') {
        const qualifier = segment.elements[0];
        const date = segment.elements[2];
        
        if (qualifier === '291' && result.coverage!.length > 0) {
          result.coverage![result.coverage!.length - 1].effectiveDate = date;
        } else if (qualifier === '292' && result.coverage!.length > 0) {
          result.coverage![result.coverage!.length - 1].terminationDate = date;
        }
      }

      // Parse errors
      if (segment.name === 'AAA') {
        result.errors!.push({
          code: segment.elements[3] || '',
          description: segment.elements[4] || '',
        });
      }
    }

    return result;
  }

  /**
   * Parse 837 - Professional/Institutional Claim
   */
  private parse837(segments: X12Segment[]): Partial<X12_837_Claim> {
    const result: Partial<X12_837_Claim> = {
      transactionType: '837',
      controlNumber: segments[0].elements[1],
      serviceLines: [],
    };

    let inLoop = '';
    let currentServiceLine: any = null;

    for (const segment of segments) {
      // Identify loops
      if (segment.name === 'NM1') {
        const entityCode = segment.elements[0];
        if (entityCode === '41') inLoop = 'submitter';
        else if (entityCode === '85') inLoop = 'billing';
        else if (entityCode === 'IL') inLoop = 'subscriber';
        else if (entityCode === 'PR') inLoop = 'payer';
        else if (entityCode === 'QC') inLoop = 'patient';
      }

      // Parse submitter
      if (inLoop === 'submitter' && segment.name === 'NM1') {
        result.submitter = {
          organizationName: segment.elements[2] || '',
          contactName: '',
          contactPhone: '',
          taxId: segment.elements[8] || '',
        };
      }

      // Parse billing provider
      if (inLoop === 'billing') {
        if (segment.name === 'NM1') {
          result.billing = {
            npi: segment.elements[8] || '',
            taxId: '',
            name: segment.elements[2] || '',
            address: { street: '', city: '', state: '', zip: '' },
          };
        }
        if (segment.name === 'N3' && result.billing) {
          result.billing.address.street = segment.elements[0] || '';
        }
        if (segment.name === 'N4' && result.billing) {
          result.billing.address.city = segment.elements[0] || '';
          result.billing.address.state = segment.elements[1] || '';
          result.billing.address.zip = segment.elements[2] || '';
        }
      }

      // Parse subscriber
      if (inLoop === 'subscriber') {
        if (segment.name === 'NM1') {
          result.subscriber = {
            payerResponsibility: 'P',
            memberId: segment.elements[8] || '',
            firstName: segment.elements[3] || '',
            lastName: segment.elements[2] || '',
            dob: '',
            gender: 'U',
            address: { street: '', city: '', state: '', zip: '' },
          };
        }
        if (segment.name === 'DMG' && result.subscriber) {
          result.subscriber.dob = segment.elements[1] || '';
          result.subscriber.gender = (segment.elements[2] || 'U') as 'M' | 'F' | 'U';
        }
      }

      // Parse payer
      if (inLoop === 'payer' && segment.name === 'NM1') {
        result.payer = {
          payerId: segment.elements[8] || '',
          name: segment.elements[2] || '',
        };
      }

      // Parse claim information
      if (segment.name === 'CLM') {
        result.claim = {
          patientControlNumber: segment.elements[0] || '',
          claimAmount: parseFloat(segment.elements[1] || '0'),
          placeOfService: segment.elements[4]?.split(':')[1] || '',
          claimFrequency: segment.elements[5]?.split(':')[0] || '',
          providerSignature: segment.elements[5]?.split(':')[1] === 'Y',
          planParticipation: segment.elements[5]?.split(':')[2] === 'Y',
          benefitsAssignment: segment.elements[5]?.split(':')[3] === 'Y',
          releaseInfo: segment.elements[5]?.split(':')[4] === 'Y',
          principalDiagnosis: '',
        };
      }

      // Parse diagnosis codes
      if (segment.name === 'HI' && result.claim) {
        const diagCodes = segment.elements
          .filter(e => e && e.startsWith('ABK:'))
          .map(e => e.replace('ABK:', ''));
        if (diagCodes.length > 0) {
          result.claim.principalDiagnosis = diagCodes[0];
          result.claim.additionalDiagnoses = diagCodes.slice(1);
        }
      }

      // Parse service lines
      if (segment.name === 'LX') {
        if (currentServiceLine && result.serviceLines) {
          result.serviceLines.push(currentServiceLine);
        }
        currentServiceLine = {
          lineNumber: segment.elements[0] || '',
          procedureCode: '',
          chargeAmount: 0,
          units: 0,
          serviceDate: '',
          placeOfService: '',
        };
      }

      if (segment.name === 'SV1' && currentServiceLine) {
        const procInfo = segment.elements[0]?.split(':');
        currentServiceLine.procedureCode = procInfo?.[1] || '';
        currentServiceLine.modifiers = procInfo?.slice(2).filter(Boolean);
        currentServiceLine.chargeAmount = parseFloat(segment.elements[1] || '0');
        currentServiceLine.units = parseFloat(segment.elements[3] || '0');
      }

      if (segment.name === 'DTP' && segment.elements[0] === '472' && currentServiceLine) {
        currentServiceLine.serviceDate = segment.elements[2] || '';
      }
    }

    // Add last service line
    if (currentServiceLine && result.serviceLines) {
      result.serviceLines.push(currentServiceLine);
    }

    return result;
  }

  /**
   * Parse 276 - Claim Status Inquiry
   */
  private parse276(segments: X12Segment[]): Partial<X12_276_Inquiry> {
    const result: Partial<X12_276_Inquiry> = {
      transactionType: '276',
      controlNumber: segments[0].elements[1],
      claims: [],
    };

    let inLoop = '';
    let currentClaim: any = null;

    for (const segment of segments) {
      if (segment.name === 'NM1') {
        const entityCode = segment.elements[0];
        if (entityCode === '1P') inLoop = 'provider';
        else if (entityCode === 'PR') inLoop = 'payer';
        else if (entityCode === 'QC') {
          inLoop = 'patient';
          if (currentClaim && result.claims) {
            result.claims.push(currentClaim);
          }
          currentClaim = {
            patient: {
              firstName: segment.elements[3] || '',
              lastName: segment.elements[2] || '',
            },
          };
        }
      }

      if (inLoop === 'provider' && segment.name === 'NM1') {
        result.provider = {
          npi: segment.elements[8] || '',
          name: segment.elements[2] || '',
        };
      }

      if (inLoop === 'payer' && segment.name === 'NM1') {
        result.payer = {
          payerId: segment.elements[8] || '',
          name: segment.elements[2],
        };
      }

      if (segment.name === 'TRN' && currentClaim) {
        currentClaim.claimSubmitterIdentifier = segment.elements[1];
      }

      if (segment.name === 'REF' && currentClaim) {
        if (segment.elements[0] === 'D9') {
          currentClaim.patientControlNumber = segment.elements[1];
        }
      }

      if (segment.name === 'DTP' && segment.elements[0] === '472' && currentClaim) {
        currentClaim.serviceDate = segment.elements[2];
      }

      if (segment.name === 'AMT' && currentClaim) {
        currentClaim.amount = parseFloat(segment.elements[1] || '0');
      }
    }

    if (currentClaim && result.claims) {
      result.claims.push(currentClaim);
    }

    return result;
  }

  /**
   * Parse 277 - Claim Status Response
   */
  private parse277(segments: X12Segment[]): Partial<X12_277_Response> {
    const result: Partial<X12_277_Response> = {
      transactionType: '277',
      controlNumber: segments[0].elements[1],
      claims: [],
    };

    let currentClaim: any = null;

    for (const segment of segments) {
      if (segment.name === 'NM1' && segment.elements[0] === 'PR') {
        result.payer = {
          payerId: segment.elements[8] || '',
          name: segment.elements[2] || '',
        };
      }

      if (segment.name === 'LX') {
        if (currentClaim && result.claims) {
          result.claims.push(currentClaim);
        }
        currentClaim = {
          patientControlNumber: '',
          claimStatus: '',
          claimStatusCategory: '',
          patient: { firstName: '', lastName: '' },
          statusDetails: [],
        };
      }

      if (segment.name === 'REF' && segment.elements[0] === 'D9' && currentClaim) {
        currentClaim.patientControlNumber = segment.elements[1];
      }

      if (segment.name === 'STC' && currentClaim) {
        const statusInfo = segment.elements[0]?.split(':');
        currentClaim.claimStatusCategory = statusInfo?.[0] || '';
        currentClaim.claimStatus = statusInfo?.[1] || '';
        
        currentClaim.statusDetails.push({
          entityCode: segment.elements[1] || '',
          statusCode: statusInfo?.[1] || '',
          statusCategoryCode: statusInfo?.[0] || '',
        });
      }

      if (segment.name === 'NM1' && segment.elements[0] === 'QC' && currentClaim) {
        currentClaim.patient = {
          firstName: segment.elements[3] || '',
          lastName: segment.elements[2] || '',
        };
      }

      if (segment.name === 'AMT' && currentClaim) {
        currentClaim.totalClaimCharge = parseFloat(segment.elements[1] || '0');
      }

      if (segment.name === 'DTP' && segment.elements[0] === '472' && currentClaim) {
        currentClaim.serviceDate = segment.elements[2];
      }
    }

    if (currentClaim && result.claims) {
      result.claims.push(currentClaim);
    }

    return result;
  }

  /**
   * Parse 835 - Electronic Remittance Advice (ERA)
   */
  private parse835(segments: X12Segment[]): Partial<X12_835_ERA> {
    const result: Partial<X12_835_ERA> = {
      transactionType: '835',
      controlNumber: segments[0].elements[1],
      claims: [],
    };

    let currentClaim: any = null;
    let currentServiceLine: any = null;

    for (const segment of segments) {
      // Parse payer
      if (segment.name === 'N1' && segment.elements[0] === 'PR') {
        result.payer = {
          name: segment.elements[1] || '',
          payerId: segment.elements[3] || '',
        };
      }

      // Parse payee
      if (segment.name === 'N1' && segment.elements[0] === 'PE') {
        result.payee = {
          npi: '',
          name: segment.elements[1] || '',
          taxId: segment.elements[3] || '',
        };
      }

      // Parse payment info
      if (segment.name === 'BPR') {
        result.payment = {
          paymentMethod: (segment.elements[9] || 'CHK') as any,
          paymentAmount: parseFloat(segment.elements[1] || '0'),
          creditDebitFlag: (segment.elements[2] || 'C') as 'C' | 'D',
          paymentDate: segment.elements[15] || '',
          traceNumber: segment.elements[6],
        };
      }

      // Parse claim info
      if (segment.name === 'CLP') {
        if (currentClaim && result.claims) {
          result.claims.push(currentClaim);
        }
        currentClaim = {
          patientControlNumber: segment.elements[0] || '',
          claimStatusCode: segment.elements[1] || '',
          totalClaimCharge: parseFloat(segment.elements[2] || '0'),
          claimPayment: parseFloat(segment.elements[3] || '0'),
          patientResponsibility: parseFloat(segment.elements[4] || '0'),
          patient: { firstName: '', lastName: '', memberId: '' },
          serviceLines: [],
          claimAdjustments: [],
        };
      }

      // Parse patient info
      if (segment.name === 'NM1' && segment.elements[0] === 'QC' && currentClaim) {
        currentClaim.patient = {
          firstName: segment.elements[3] || '',
          lastName: segment.elements[2] || '',
          memberId: segment.elements[8] || '',
        };
      }

      // Parse claim-level adjustments
      if (segment.name === 'CAS' && currentClaim && !currentServiceLine) {
        const groupCode = segment.elements[0] as any;
        for (let i = 1; i < segment.elements.length; i += 3) {
          if (segment.elements[i]) {
            currentClaim.claimAdjustments.push({
              groupCode,
              reasonCode: segment.elements[i],
              amount: parseFloat(segment.elements[i + 1] || '0'),
            });
          }
        }
      }

      // Parse service lines
      if (segment.name === 'SVC' && currentClaim) {
        if (currentServiceLine) {
          currentClaim.serviceLines.push(currentServiceLine);
        }
        const procInfo = segment.elements[0]?.split(':');
        currentServiceLine = {
          procedureCode: procInfo?.[1] || '',
          modifiers: procInfo?.slice(2).filter(Boolean),
          chargedAmount: parseFloat(segment.elements[1] || '0'),
          paidAmount: parseFloat(segment.elements[2] || '0'),
          units: parseFloat(segment.elements[4] || '0'),
          serviceDate: '',
          adjustments: [],
        };
      }

      // Parse service line adjustments
      if (segment.name === 'CAS' && currentServiceLine) {
        const groupCode = segment.elements[0] as any;
        for (let i = 1; i < segment.elements.length; i += 3) {
          if (segment.elements[i]) {
            currentServiceLine.adjustments.push({
              groupCode,
              reasonCode: segment.elements[i],
              amount: parseFloat(segment.elements[i + 1] || '0'),
              quantity: segment.elements[i + 2] ? parseFloat(segment.elements[i + 2]) : undefined,
            });
          }
        }
      }

      // Parse service date
      if (segment.name === 'DTM' && segment.elements[0] === '472' && currentServiceLine) {
        currentServiceLine.serviceDate = segment.elements[1];
      }
    }

    // Add last service line and claim
    if (currentServiceLine && currentClaim) {
      currentClaim.serviceLines.push(currentServiceLine);
    }
    if (currentClaim && result.claims) {
      result.claims.push(currentClaim);
    }

    return result;
  }

  // ─── Generation Methods (X12 Serialization) ───────────────────────────

  /**
   * Generate X12 270 - Eligibility Inquiry
   */
  generate270(request: X12_270_Request): string {
    const segments: string[] = [];
    const date = this.formatDate(new Date());
    const time = this.formatTime(new Date());
    const controlNum = request.controlNumber || this.generateControlNumber();

    // ISA
    segments.push(this.buildISA(controlNum, date, time));

    // GS
    segments.push(this.buildGS('HS', controlNum, date, time));

    // ST
    segments.push(`ST*270*${controlNum}*005010X279A1`);

    // BHT
    segments.push(`BHT*0022*13*${controlNum}*${date}*${time}`);

    // 2000A Information Source (Payer)
    segments.push(`HL*1**20*1`);
    segments.push(`NM1*PR*2*${request.payer.name || 'PAYER'}*****PI*${request.payer.payerId}`);

    // 2000B Information Receiver (Provider)
    segments.push(`HL*2*1*21*1`);
    segments.push(`NM1*1P*2*${request.provider.name}*****XX*${request.provider.npi}`);

    // 2000C Subscriber
    segments.push(`HL*3*2*22*0`);
    segments.push(`TRN*1*${controlNum}*${request.provider.npi}`);
    segments.push(`NM1*IL*1*${request.subscriber.lastName}*${request.subscriber.firstName}****MI*${request.subscriber.memberId}`);
    segments.push(`DMG*D8*${request.subscriber.dob.replace(/-/g, '')}${request.subscriber.gender ? '*' + request.subscriber.gender : ''}`);
    
    if (request.serviceType) {
      segments.push(`EQ*${request.serviceType}`);
    }

    if (request.serviceDate) {
      segments.push(`DTP*291*D8*${request.serviceDate.replace(/-/g, '')}`);
    }

    // SE
    const segmentCount = segments.length - 2 + 1; // Exclude ISA/GS, include SE
    segments.push(`SE*${segmentCount}*${controlNum}`);

    // GE
    segments.push(`GE*1*${controlNum}`);

    // IEA
    segments.push(`IEA*1*${controlNum.padStart(9, '0')}`);

    return segments.join('~\n') + '~\n';
  }

  /**
   * Generate X12 276 - Claim Status Inquiry
   */
  generate276(inquiry: X12_276_Inquiry): string {
    const segments: string[] = [];
    const date = this.formatDate(new Date());
    const time = this.formatTime(new Date());
    const controlNum = inquiry.controlNumber || this.generateControlNumber();

    segments.push(this.buildISA(controlNum, date, time));
    segments.push(this.buildGS('HR', controlNum, date, time));
    segments.push(`ST*276*${controlNum}*005010X212`);
    segments.push(`BHT*0010*13*${controlNum}*${date}*${time}`);

    // 2000A Information Source (Payer)
    segments.push(`HL*1**20*1`);
    segments.push(`NM1*PR*2*${inquiry.payer.name || 'PAYER'}*****PI*${inquiry.payer.payerId}`);

    // 2000B Information Receiver (Provider)
    segments.push(`HL*2*1*21*1`);
    segments.push(`NM1*1P*2*${inquiry.provider.name}*****XX*${inquiry.provider.npi}`);

    // 2000C Provider of Service
    segments.push(`HL*3*2*19*1`);

    // Claims
    inquiry.claims.forEach((claim, idx) => {
      segments.push(`HL*${4 + idx}*3*PT*0`);
      segments.push(`TRN*1*${claim.claimSubmitterIdentifier || controlNum + idx}`);
      
      if (claim.patientControlNumber) {
        segments.push(`REF*D9*${claim.patientControlNumber}`);
      }

      segments.push(`NM1*QC*1*${claim.patient.lastName}*${claim.patient.firstName}****MI*${claim.patient.memberId || ''}`);
      
      if (claim.serviceDate) {
        segments.push(`DTP*472*D8*${claim.serviceDate.replace(/-/g, '')}`);
      }

      if (claim.amount) {
        segments.push(`AMT*T3*${claim.amount.toFixed(2)}`);
      }
    });

    const segmentCount = segments.length - 2 + 1;
    segments.push(`SE*${segmentCount}*${controlNum}`);
    segments.push(`GE*1*${controlNum}`);
    segments.push(`IEA*1*${controlNum.padStart(9, '0')}`);

    return segments.join('~\n') + '~\n';
  }

  // ─── Helper Methods ────────────────────────────────────────────────────

  private buildISA(controlNum: string, date: string, time: string): string {
    return `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *${date}*${time}*^*00501*${controlNum.padStart(9, '0')}*0*P*:`;
  }

  private buildGS(functionalCode: string, controlNum: string, date: string, time: string): string {
    return `GS*${functionalCode}*SENDER*RECEIVER*${date}*${time}*${controlNum}*X*005010`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(2, 10).replace(/-/g, '');
  }

  private formatTime(date: Date): string {
    return date.toISOString().slice(11, 19).replace(/:/g, '');
  }

  private generateControlNumber(): string {
    return Math.floor(Math.random() * 1000000000).toString();
  }
}

// ─── Validation Functions ─────────────────────────────────────────────────

export function validateX12Format(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('Empty X12 content');
    return { valid: false, errors };
  }

  // Check for ISA segment
  if (!content.startsWith('ISA')) {
    errors.push('Missing ISA segment at beginning');
  }

  // Check for IEA segment
  if (!content.includes('IEA*')) {
    errors.push('Missing IEA segment');
  }

  // Check segment terminator
  if (!content.includes('~')) {
    errors.push('Missing segment terminator (~)');
  }

  // Basic structure validation
  const segments = content.split('~').filter(s => s.trim());
  if (segments.length < 3) {
    errors.push('Insufficient segments for valid X12');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Utility to extract transaction type from X12 content
 */
export function getTransactionType(content: string): string | null {
  const stMatch = content.match(/ST\*(\d{3})\*/);
  return stMatch ? stMatch[1] : null;
}

/**
 * Pretty print X12 for debugging
 */
export function prettyPrintX12(content: string): string {
  return content.split('~').filter(s => s.trim()).join('~\n') + '~\n';
}
