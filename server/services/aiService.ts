import { GoogleGenAI } from '@google/genai';
import { DBStorage, IPrinter, IPrintJob, IActivity } from '../db/storage.js';

let genAIClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }

  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export interface TroubleshootResult {
  printerName: string;
  model: string;
  error: string;
  explanation: string;
  possibleCauses: string[];
  recommendedSteps: string[];
  whenToContactSupport: string;
  confidenceScore: number;
}

export interface SummaryResult {
  period: string;
  generatedAt: string;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  pagesPrinted: number;
  activeIssuesCount: number;
  executiveSummary: string;
  printerHealthInsights: string[];
  recommendations: string[];
}

export class AIService {
  /**
   * AI-powered troubleshooting for printer errors
   */
  public static async troubleshootPrinter(printerId: string, customError?: string): Promise<TroubleshootResult> {
    const printer = DBStorage.findPrinterById(printerId);
    if (!printer) {
      throw new Error(`Printer with ID ${printerId} not found.`);
    }

    const errorToAnalyze = customError || printer.currentError || 'Unspecified Hardware Failure';
    const recentJobs = DBStorage.getJobs()
      .filter(j => j.printerId === printerId)
      .slice(0, 5);

    const prompt = `You are a certified senior hardware & network print technician for an enterprise print management system.
A user requests immediate troubleshooting assistance for a network printer.

Printer Details:
- Name: ${printer.name}
- Model: ${printer.model}
- IP Address: ${printer.ipAddress}
- Location: ${printer.location}
- Current Status: ${printer.status}
- Reported Error: ${errorToAnalyze}
- Toner Level: ${printer.tonerLevel ?? 'N/A'}%
- Paper Level: ${printer.paperLevel ?? 'N/A'}%
- Total Lifetime Pages: ${printer.pagesPrinted}
- Recent Job Logs: ${JSON.stringify(recentJobs.map(j => ({ doc: j.documentName, status: j.status, err: j.errorMessage })))}

Provide an authoritative, clear, and actionable troubleshooting plan.
You MUST format your output strictly as a valid JSON object matching this schema:
{
  "explanation": "Clear explanation of what this error indicates in this specific printer model",
  "possibleCauses": ["Cause 1", "Cause 2", "Cause 3"],
  "recommendedSteps": ["Step 1 with specific physical or software action", "Step 2...", "Step 3..."],
  "whenToContactSupport": "Explicit guidelines on when hardware technician on-site dispatch or warranty escalation is needed",
  "confidenceScore": 95
}
Do not wrap in markdown quotes if possible, output raw JSON.`;

    const ai = getAIClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        return {
          printerName: printer.name,
          model: printer.model,
          error: errorToAnalyze,
          explanation: parsed.explanation || 'Detailed hardware diagnostics performed.',
          possibleCauses: Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : ['Mechanical jam or sensor block'],
          recommendedSteps: Array.isArray(parsed.recommendedSteps) ? parsed.recommendedSteps : ['Power cycle the printer', 'Inspect tray 2'],
          whenToContactSupport: parsed.whenToContactSupport || 'Contact vendor if the issue persists after clearing the paper path.',
          confidenceScore: parsed.confidenceScore || 94,
        };
      } catch (err) {
        console.error('Gemini troubleshooting error, utilizing specialized rule-based fallback:', err);
      }
    }

    // Graceful intelligent fallback when API key is not yet set
    return this.generateFallbackTroubleshoot(printer, errorToAnalyze);
  }

  /**
   * AI-generated activity summary of current fleet
   */
  public static async generateSummary(): Promise<SummaryResult> {
    const printers = DBStorage.getPrinters();
    const jobs = DBStorage.getJobs();
    const activities = DBStorage.getActivities();

    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'Completed').length;
    const failedJobs = jobs.filter(j => j.status === 'Failed').length;
    const queuedOrPrinting = jobs.filter(j => j.status === 'Queued' || j.status === 'Printing').length;
    const totalPages = jobs
      .filter(j => j.status === 'Completed')
      .reduce((sum, j) => sum + (j.pages * (j.copies || 1)), 0);

    const errorPrinters = printers.filter(p => p.status === 'Error' || p.status === 'Maintenance' || p.status === 'Offline');

    const prompt = `You are an AI Print Operations Analyst.
Analyze the following operational data from the company's enterprise printing dashboard and produce an executive-ready operational briefing.

Operational Metrics:
- Total Print Jobs: ${totalJobs}
- Completed Print Jobs: ${completedJobs}
- Failed Print Jobs: ${failedJobs}
- Active / Queued Jobs: ${queuedOrPrinting}
- Total Pages Printed: ${totalPages}
- Total Printers in Fleet: ${printers.length}
- Printers with Issues (${errorPrinters.length}): ${JSON.stringify(errorPrinters.map(p => ({ name: p.name, model: p.model, status: p.status, error: p.currentError })))}
- Recent Activities (latest 5): ${JSON.stringify(activities.slice(0, 5).map(a => a.description))}

You MUST return a JSON object strictly matching this schema:
{
  "executiveSummary": "A concise 2-3 sentence overview highlighting throughput, reliability rate, and operational health.",
  "printerHealthInsights": [
    "Insight regarding printer status and downtime risks",
    "Insight regarding consumable or volume utilization"
  ],
  "recommendations": [
    "Actionable step 1",
    "Actionable step 2",
    "Actionable step 3"
  ]
}`;

    const ai = getAIClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        return {
          period: 'Past 24 Hours & Fleet Status',
          generatedAt: new Date().toISOString(),
          totalJobs,
          completedJobs,
          failedJobs,
          pagesPrinted: totalPages,
          activeIssuesCount: errorPrinters.length,
          executiveSummary: parsed.executiveSummary || 'Fleet operations are operating normally with selective maintenance required.',
          printerHealthInsights: Array.isArray(parsed.printerHealthInsights) ? parsed.printerHealthInsights : [
            `${errorPrinters.length} printers currently require attention (Error, Offline, or Maintenance).`,
            `Overall print completion rate is currently at ${totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 100}%.`
          ],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [
            'Clear paper path on Design Canon imageRUNNER',
            'Verify network connectivity for Reception Desk Compact'
          ],
        };
      } catch (err) {
        console.error('Gemini summary error, utilizing fallback summary:', err);
      }
    }

    return {
      period: 'Past 24 Hours & Fleet Status',
      generatedAt: new Date().toISOString(),
      totalJobs,
      completedJobs,
      failedJobs,
      pagesPrinted: totalPages,
      activeIssuesCount: errorPrinters.length,
      executiveSummary: `Fleet operating with ${completedJobs} successful print jobs and ${totalPages} pages printed. ${errorPrinters.length} devices currently require attention.`,
      printerHealthInsights: [
        `${printers.filter(p => p.status === 'Online' || p.status === 'Printing').length} of ${printers.length} printers are online and ready for incoming print jobs.`,
        errorPrinters.length > 0
          ? `Attention needed on: ${errorPrinters.map(p => p.name).join(', ')}.`
          : 'All fleet printers are reporting normal operational telemetry.',
      ],
      recommendations: [
        'Inspect paper jam sensor on Canon imageRUNNER in Floor 2 Creative Studio.',
        'Ping and verify IP route for Reception Desk Compact (192.168.1.106).',
        'Review queued jobs to prevent spooler backlog during peak hours.',
      ],
    };
  }

  /**
   * Grounded interactive AI chat assistant
   */
  public static async chatWithFleetContext(userMessage: string, history: Array<{ role: 'user' | 'assistant'; text: string }> = []): Promise<string> {
    const printers = DBStorage.getPrinters();
    const jobs = DBStorage.getJobs();
    const activities = DBStorage.getActivities();

    const fleetContext = {
      printers: printers.map(p => ({
        id: p._id,
        name: p.name,
        model: p.model,
        location: p.location,
        ipAddress: p.ipAddress,
        status: p.status,
        toner: p.tonerLevel,
        paper: p.paperLevel,
        pagesPrinted: p.pagesPrinted,
        currentJob: p.currentJob,
        currentError: p.currentError,
      })),
      recentJobs: jobs.slice(0, 10).map(j => ({
        id: j._id,
        document: j.documentName,
        user: j.userName || j.userEmail,
        printer: j.printerName,
        pages: j.pages,
        copies: j.copies,
        colorMode: j.colorMode,
        status: j.status,
        error: j.errorMessage,
        created: j.createdAt,
      })),
      recentActivities: activities.slice(0, 6).map(a => ({
        user: a.userName,
        action: a.action,
        desc: a.description,
        time: a.createdAt,
      })),
    };

    const systemPrompt = `You are "PrintAI", the intelligent operations assistant for the enterprise Printing Dashboard.
You have direct real-time access to the company's live printer fleet database, job queues, error telemetry, and user activities.

CRITICAL INSTRUCTIONS:
1. ONLY answer based on the real fleet data provided below.
2. DO NOT invent, hallucinate, or assume printer data that does not exist in the database.
3. If the user asks about a printer, job, or metric that is NOT in the database, explicitly inform them that the requested information is not available in current system records.
4. When discussing errors, provide practical, step-by-step diagnostic advice.
5. Format your answers clearly with markdown lists, bold headers, and concise operational terminology.

CURRENT LIVE DATABASE STATE:
${JSON.stringify(fleetContext, null, 2)}
`;

    const ai = getAIClient();
    if (ai) {
      try {
        // Construct conversation turns
        const contents: any[] = [];
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
          },
        });

        return response.text || 'I analyzed the printing fleet telemetry, but no response was returned.';
      } catch (err) {
        console.error('Gemini chat error, fallback to context responder:', err);
      }
    }

    return this.generateFallbackChatResponse(userMessage, fleetContext);
  }

  private static generateFallbackTroubleshoot(printer: IPrinter, error: string): TroubleshootResult {
    const lower = error.toLowerCase();
    if (lower.includes('jam') || lower.includes('paper')) {
      return {
        printerName: printer.name,
        model: printer.model,
        error,
        explanation: `The internal paper path optical sensors detected that a sheet of media failed to reach the registration roller within the expected millisecond cycle for ${printer.model}.`,
        possibleCauses: [
          'Foreign paper fragment or torn media remnant lodged near Tray 2 pickup assembly',
          'Worn feed rollers failing to grab sheet leading edge',
          'Incorrect paper weight/thickness setting configured on the control panel',
        ],
        recommendedSteps: [
          'Open Tray 2 and inspect the rear sheet guides to ensure they are firmly snug against the paper stack.',
          'Open the right-side access door and gently pull any trapped media in the direction of the paper feed path.',
          'Clean the rubber pickup rollers using a lint-free cloth lightly dampened with isopropyl alcohol.',
          'Cycle power off, wait 15 seconds, and power on to re-calibrate photo-interrupter sensors.',
        ],
        whenToContactSupport: 'If error persists after clearing all visible paths, the optical interrupter sensor board or solenoid actuator may require technician replacement.',
        confidenceScore: 92,
      };
    } else if (lower.includes('unreachable') || lower.includes('offline') || lower.includes('timeout')) {
      return {
        printerName: printer.name,
        model: printer.model,
        error,
        explanation: `The print server SNMP and port 9100/RAW polling daemon failed to establish a TCP handshake with IP ${printer.ipAddress}.`,
        possibleCauses: [
          'Printer is powered off or in deep sleep mode without Wake-on-LAN',
          'Ethernet cable disconnected or DHCP lease reassigned without static IP reservation',
          'Subnet gateway firewall rule blocking bidirectional RAW 9100 / LPD traffic',
        ],
        recommendedSteps: [
          `Physically verify the printer control panel display and status LEDs at ${printer.location}.`,
          `Check Ethernet link light at the back of ${printer.model}.`,
          `Attempt ping: "ping ${printer.ipAddress}" from the print server terminal.`,
          'Verify if the router or managed switch port has VLAN tagging aligned with the print subnet.',
        ],
        whenToContactSupport: 'Contact network operations if the printer is powered on and shows an active IP link on its LCD, but local gateway routes reject traffic.',
        confidenceScore: 95,
      };
    }

    return {
      printerName: printer.name,
      model: printer.model,
      error,
      explanation: `System diagnostic report for ${printer.name}: ${error}. The device requires manual inspection to restore nominal print service.`,
      possibleCauses: [
        'Consumable depletion (toner, drum unit, or fuser lifecycle threshold)',
        'Firmware buffer overflow or unhandled PostScript parser state',
        'Hardware mechanical latch or sensor out of alignment',
      ],
      recommendedSteps: [
        'Check printer status menu on the physical LCD screen.',
        'Verify toner cartridge and waste container seating.',
        'Perform a soft reset from the printer embedded web server (EWS) or power switch.',
      ],
      whenToContactSupport: 'Escalate to certified hardware repair vendor if hardware error codes persist after power cycle.',
      confidenceScore: 88,
    };
  }

  private static generateFallbackChatResponse(userMessage: string, context: any): string {
    const q = userMessage.toLowerCase();
    const printers: any[] = context.printers;
    const jobs: any[] = context.recentJobs;

    if (q.includes('why') && (q.includes('error') || q.includes('printer 2') || q.includes('canon'))) {
      const p2 = printers.find(p => p.id === 'prn_02' || p.name.toLowerCase().includes('canon'));
      if (p2) {
        return `### Diagnostic for **${p2.name}**\n\n- **Status:** ${p2.status}\n- **Error Code:** ${p2.currentError}\n- **Location:** ${p2.location}\n- **Current Job Blocked:** ${p2.currentJob || 'None'}\n\n**Quick Action:** This error is caused by a paper jam or media sensor obstruction in Tray 2. You can click the **AI Troubleshooting** button on this printer in the **Printers** page to see exact step-by-step clearance instructions.`;
      }
    }

    if (q.includes('summarize') || q.includes('summary') || q.includes('activity')) {
      const completed = jobs.filter(j => j.status === 'Completed').length;
      const failed = jobs.filter(j => j.status === 'Failed').length;
      return `### Fleet Activity Summary\n\n- **Total Monitored Printers:** ${printers.length}\n- **Active / Online Printers:** ${printers.filter(p => p.status === 'Online' || p.status === 'Printing').length}\n- **Recent Completed Jobs:** ${completed}\n- **Failed Jobs:** ${failed}\n- **Printers with Issues:** ${printers.filter(p => p.status === 'Error' || p.status === 'Offline' || p.status === 'Maintenance').map(p => `${p.name} (${p.status})`).join(', ')}\n\nWould you like me to trigger an automated diagnosis on any specific printer?`;
    }

    if (q.includes('which printer has the most') || q.includes('most jobs') || q.includes('most used')) {
      const sorted = [...printers].sort((a, b) => (b.pagesPrinted || 0) - (a.pagesPrinted || 0));
      const top = sorted[0];
      return `According to our database telemetry, the most utilized printer is **${top.name}** located at **${top.location}** with a cumulative **${top.pagesPrinted.toLocaleString()} pages printed**.\n\nRunner-up is **${sorted[1]?.name}** with **${sorted[1]?.pagesPrinted.toLocaleString()} pages printed**.`;
    }

    if (q.includes('offline') || q.includes('what should i do if a printer is offline')) {
      const offlinePrinters = printers.filter(p => p.status === 'Offline');
      return `### Offline Printer Diagnostic Guide\n\nCurrently, ${offlinePrinters.length} printer is offline: **${offlinePrinters.map(p => `${p.name} (${p.ipAddress})`).join(', ') || 'None'}**.\n\n**Recommended Checklist:**\n1. **Power Check:** Confirm the device isn't in un-wakeable deep sleep or powered down at the physical wall switch.\n2. **Network Cable:** Check for an active amber/green link LED on the RJ45 port.\n3. **Ping Test:** Run a terminal ping to the assigned IP (${offlinePrinters[0]?.ipAddress || '192.168.1.106'}).\n4. **Web Server:** Navigate to \`http://${offlinePrinters[0]?.ipAddress || '192.168.1.106'}\` in your browser to check the internal management console.`;
    }

    if (q.includes('possible issues') || q.includes('issues with recent print jobs') || q.includes('failed')) {
      const failedJobs = jobs.filter(j => j.status === 'Failed');
      return `### Recent Print Job Issues\n\nThere are **${failedJobs.length} failed jobs** in recent history:\n\n${failedJobs.map(j => `- **${j.document}** (Printer: ${j.printer}, User: ${j.user})\n  *Reason:* ${j.error || 'Network buffer failure'}`).join('\n\n')}\n\nI recommend resolving the physical paper jam on **Design Canon imageRUNNER** before re-queuing job *Brand_Guidelines_Booklet_v2.pdf*.`;
    }

    return `Hello! I am your **PrintAI Fleet Assistant**. Based on our live database, we are monitoring **${printers.length} printers** with **${printers.filter(p => p.status === 'Online' || p.status === 'Printing').length} currently active**.\n\nYou can ask me:\n- *"Why is printer 2 showing an error?"*\n- *"Summarize today's printing activity."*\n- *"Which printer has the most jobs?"*\n- *"What should I do if a printer is offline?"*\n- *"Show me possible issues with recent print jobs."*`;
  }
}
