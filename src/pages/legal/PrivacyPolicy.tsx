import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import logoImage from '../../assets/logo.png'

const markdownContent = `
# Privacy Policy
**Last Updated: January 2026**

## 1. Introduction

Vimpound AI (“Vimpound,” “we,” “us,” or “our”) provides AI-powered voice and dashboard software for tow companies, impound lots, and related vehicle-services businesses (collectively, the **“Service”**).

This Privacy Policy explains how we collect, use, disclose, and safeguard information when you:

- use the Service (including our web dashboard, voice AI agents, and related tools),
- visit any Vimpound-controlled website or subdomain, or
- otherwise interact with us (for example, by phone or email).

Vimpound frequently provides the Service **on behalf of its business customers** (each, a **“Customer”**), such as tow companies or impound lots. When we process information related to calls placed to a Customer’s phone line or data entered by a Customer, we do so as a **service provider / processor**. In those cases, the Customer’s own privacy notice governs their relationship with callers.

**If you are a caller**, you are a customer of the tow or impound company—not of Vimpound. Privacy requests should generally be directed to that company first.

By accessing or using the Service, you acknowledge that you have read and understood this Privacy Policy.

---

## 2. Information We Collect

The information we collect depends on how you interact with the Service. We describe it using categories commonly required by U.S. state privacy laws (including the CPRA).

### 2.1 Personal Identifiers

- Name
- Email address
- Phone number
- Mailing or business address
- Account login information (usernames and hashed passwords)

### 2.2 Caller & Vehicle Information

Information provided by callers during phone calls, which may include:

- Caller phone number
- Vehicle details (e.g., make, model, color, license plate)
- Tow request details
- Impound-related questions or information
- Dates, locations, and descriptions provided verbally

### 2.3 Voice & Communication Data

- Call audio recordings
- Call transcripts
- Voicemail recordings
- Caller-ID metadata
- AI-generated summaries, tags, or classifications derived from calls

### 2.4 Customer (Dashboard User) Information

- Name, email, and company name
- User roles and permissions
- Configuration settings for AI agents
- Usage metrics (e.g., call minutes, feature usage)

### 2.5 Device & Automatic Usage Data

- IP address
- Browser type and operating system
- Device identifiers
- Log files and feature usage data
- Cookies and similar technologies used for authentication and analytics

### 2.6 Support & Other Sources

- Support communications
- Survey responses
- Information from third-party integrations you connect (e.g., Stripe)

We do not knowingly collect personal information from children under 18.

---

## 3. How We Use Information

We may use the information described above to:

- Operate, maintain, and provide the Service
- Route, record, transcribe, and analyze phone calls
- Display tow requests and vehicle records to authorized Customer staff
- Support human-in-the-loop workflows
- Generate AI-assisted summaries and internal evaluations
- Provide customer support
- Bill Customers and process payments
- Monitor usage, performance, and security
- Detect and prevent fraud, abuse, or misuse
- Comply with legal and regulatory obligations

### AI Processing

When enabled by a Customer, Vimpound applies AI models to call audio and related data to generate transcripts, summaries, and classifications. **AI output is automatically generated and may contain errors.** Customers are responsible for reviewing and deciding whether to rely on such output.

**We do not use Customer or caller data to train general-purpose AI models.** We may use data internally for quality assurance, evaluation, prompt tuning, testing, and improvement of the Service.

---

## 4. Sharing & Disclosure of Information

We may share information as follows:

### 4.1 Customers (Tow / Impound Companies)

Information from calls or dashboards is shared with the relevant Customer that operates the phone line or account.

### 4.2 Service Providers & Subprocessors

We share information with vendors that help us operate the Service, including:

- Telephony providers (e.g., call routing and recording)
- AI infrastructure providers
- Cloud hosting providers
- Payment processors (e.g., Stripe)
- Customer support and monitoring tools

These providers are bound by contractual confidentiality and data-protection obligations.

### 4.3 Call Recording & Consent

If call recording or monitoring is enabled, **the Customer—not Vimpound—is responsible for providing required notice and obtaining consent** from callers under applicable law. Any sample scripts or prompts we provide are for convenience only and do not constitute legal advice.

### 4.4 Legal & Regulatory Requirements

We may disclose information if required to comply with applicable law, regulation, subpoena, court order, or lawful governmental request.

### 4.5 Business Transfers

Information may be disclosed in connection with a merger, acquisition, or sale of assets, subject to appropriate confidentiality protections.

---

## 5. Data Retention

We retain personal information only as long as reasonably necessary to:

- Provide and operate the Service
- Fulfill the purposes described in this Policy
- Comply with legal or contractual obligations
- Resolve disputes and enforce agreements

Customer-facing records (such as tow requests or vehicle entries) are deleted by the Customer through the dashboard. Backend logs, recordings, or transcripts may be retained for operational, legal, or compliance purposes.

---

## 6. Security

We implement reasonable administrative, technical, and organizational measures designed to protect information, including:

- Encryption in transit and at rest
- Access controls and authentication mechanisms
- Monitoring for unauthorized access

No system is 100% secure. You are responsible for safeguarding your own account credentials.

If we become aware of a breach involving unencrypted personal information, we will notify affected Customers without undue delay and in accordance with applicable law.

---

## 7. Your Rights & Choices

Depending on your jurisdiction, you may have rights to:

- Access personal information
- Request correction or deletion
- Receive a copy of certain data
- Opt out of certain processing where applicable

**Callers** should direct requests first to the tow or impound company they contacted.  
**Customers** may contact us directly using the information below.

---

## 8. Cookies & Tracking

We use cookies and similar technologies for:

- Authentication and session management
- Basic analytics
- Service functionality

We do not use third-party advertising cookies or engage in cross-context behavioral advertising.

---

## 9. International Users

The Service is operated from the United States. If you access the Service from outside the U.S., you acknowledge that information may be transferred to and processed in the United States and other jurisdictions with different data-protection laws.

---

## 10. Children’s Privacy

The Service is not directed to children under 18, and we do not knowingly collect personal information from children. If you believe we have done so inadvertently, please contact us.

---

## 11. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Material changes will be communicated through the Service or by other reasonable means. Continued use of the Service after the effective date constitutes acceptance of the revised Policy.

---

## 12. Contact Us

**Vimpound AI**  
Scottsdale, AZ  
Email: **help.nyalmo@gmail.com**

---

 2026 Vimpound AI. All rights reserved.


`

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  const handleDashboardClick = async () => {
    try {
      // Step 1: Check if user has any token at all
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !sessionData.session) {
        // No session found, navigate to signin
        navigate('/signin')
        return
      }

      // Step 2: Verify the token is legit by calling Supabase from the frontend
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData.user) {
        // Token is invalid or expired, navigate to signin
        navigate('/signin')
        return
      }

      // Step 3: Both checks passed - user is verified and logged in
      navigate('/dashboard/overview')
    } catch (error) {
      // Handle any unexpected errors by redirecting to signin
      console.error('Error checking authentication:', error)
      navigate('/signin')
    }
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9fafb] via-white to-[#f3f4f6] p-8 md:p-10 lg:p-12">
      {/* Logo Button - Top Left Corner - Fixed position, always visible */}
      <button
        onClick={handleLogoClick}
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          padding: '16px 32px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: 'scale(1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <img 
          src={logoImage} 
          alt="Logo" 
          style={{
            height: '80px',
            width: 'auto',
            objectFit: 'contain',
            transform: 'scale(1.5)',
          }}
        />
      </button>
      {/* Dashboard Button - Top Right Corner - Fixed position, always visible */}
      <button
        onClick={handleDashboardClick}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '16px 32px',
          backgroundColor: '#12A594',
          color: '#ffffff',
          border: 'none',
          borderRadius: '9999px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
          transform: 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0f8a7a'
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#12A594'
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        Open Dashboard
      </button>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 md:p-10 shadow-lg">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
