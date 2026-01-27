import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import logoImage from '../../assets/logo.png'

const markdownContent = `
# Terms and Conditions
## Terms of Service
**Last Updated: January 2026**

Welcome to **Vimpound**, provided by **Vimpound, Inc.** (“Vimpound,” “we,” “our,” or “us”). These Terms of Service (these **“Terms”** or this **“Agreement”**) govern your access to and use of our software applications, voice-AI systems, dashboards, APIs, and related services (the **“Software”**), including associated data processing and infrastructure (the **“Platform”**), and any websites, subdomains, or services owned or controlled by Vimpound that provide access to the Software or Platform (collectively, the **“Service”**).

These Terms constitute a binding contract between you—the business entity subscribing to the Service, or the authorized representative of such entity (**“you”** or **“Subscriber”**)—and Vimpound. “Subscriber” includes your employees, contractors, or other authorized users who access the Service under your account.

By executing an order form, pricing sheet, quotation, or service agreement issued by Vimpound (an **“Order”**), or by clicking an “I Agree” button or otherwise accessing or using the Service, you:

1. Acknowledge that you have read and understood these Terms  
2. Represent that you have authority to bind the Subscriber  
3. Agree to be bound by these Terms and all documents incorporated by reference, including:
   - these Terms of Service  
   - any Order  
   - Vimpound’s Privacy Policy  
   - any data-processing addendum or feature-specific terms we may provide  
   (collectively, **“Ancillary Terms”**)

**PLEASE READ CAREFULLY. THESE TERMS INCLUDE A MANDATORY ARBITRATION CLAUSE AND A CLASS-ACTION / JURY-TRIAL WAIVER.**

---

## 1. LICENSE GRANT

### 1.1 Limited License
Subject to your continuous compliance with these Terms, Vimpound grants you a limited, revocable, non-exclusive, non-transferable, non-sublicensable license to access and use the Service solely for your internal business operations as a tow company, impound lot, or related vehicle-services provider. No other rights are granted.

You may not resell, sublicense, or provide the Service to third parties except as expressly permitted by your Order.

---

## 2. THE VIMPOUND SERVICE

### 2.1 Service Description
The Service provides AI-powered voice agents and dashboards designed to support tow requests, impound-lot inquiries, and vehicle-management workflows. Features may include, without limitation:

- AI-powered phone agents with real phone numbers  
- Call handling, recording, transcription, and summarization  
- Real-time tow-request dashboards  
- Vehicle-record management panels  
- Human-in-the-loop workflows  
- Analytics and reporting tools  

Vimpound may modify, add, or remove features at any time. If your Order conflicts with these Terms, your Order controls.

### 2.2 Third-Party Providers
The Service integrates with third-party providers (including telephony, AI, and payment processors). Your use of such third-party services may be subject to separate terms. **VIMPOUND DISCLAIMS ALL LIABILITY ARISING FROM THIRD-PARTY SERVICES, WHICH YOU USE AT YOUR OWN RISK.**

### 2.3 Changes to Terms
We may modify these Terms at any time. Material changes will be communicated through the Service or by email. Continued use of the Service constitutes acceptance of the revised Terms.

### 2.4 Support
Support is provided via email or other channels as described in your Order. Support availability may vary by plan.

---

## 3. DATA, RECORDINGS & PRIVACY

### 3.1 Subscriber Data
You may submit or generate data through the Service, including call audio, call transcripts, AI-generated summaries, tow requests, and vehicle records (**“Subscriber Data”**). As between the parties, **you own your Subscriber Data**.

### 3.2 License to Vimpound
You grant Vimpound a non-exclusive, worldwide, royalty-free license to process, store, analyze, and use Subscriber Data solely to provide, maintain, secure, evaluate, and improve the Service. This includes use of anonymized or aggregated data for internal analytics and quality assurance.

### 3.3 Deletion and Control
Subscriber Data displayed in customer-facing dashboards (including tow requests and vehicle records) is controlled by you. Once deleted by you, such data will no longer be accessible to the AI agent for lookup purposes. Backend logs, recordings, or transcripts may be retained for operational, legal, or compliance purposes.

### 3.4 Call Recording & Consent
Calls handled by the Service may be recorded, transcribed, or analyzed by the Service or its providers.

**YOU ARE SOLELY RESPONSIBLE FOR OBTAINING ALL LEGALLY REQUIRED NOTICES AND CONSENTS** under applicable federal, state, and local laws governing call recording, monitoring, and wiretapping. Vimpound does not provide legal advice and does not guarantee compliance with jurisdiction-specific consent laws.

### 3.5 Compliance with Privacy Laws
You represent and warrant that your collection and use of Subscriber Data complies with all applicable privacy, data-protection, and telecommunications laws. Vimpound acts as a service provider or processor, not as the data controller.

---

## 4. USE OF THE SERVICE

### 4.1 Accounts
You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.

### 4.2 Human-in-the-Loop Responsibility
The Service provides AI-generated information and call handling assistance only. **You remain solely responsible for all operational decisions**, including but not limited to dispatching tow trucks, releasing vehicles, and responding to callers.

### 4.3 No Emergency Use
The Service is **not an emergency service** and must not be used as a replacement for emergency response systems. The AI agent does not independently contact law enforcement or emergency services.

### 4.4 Prohibited Uses
You may not use the Service to:
- Perform or facilitate illegal towing or impound activity  
- Harass, threaten, or impersonate others  
- Impersonate law enforcement or government entities  
- Upload false or misleading vehicle records  
- Violate any applicable law  

Vimpound may suspend or terminate access for violations.

---

## 5. OWNERSHIP & INTELLECTUAL PROPERTY

The Service, Software, and all related intellectual property are owned by Vimpound or its licensors. Except for the limited license granted herein, no rights are transferred to you.

---

## 6. FEES & PAYMENT

### 6.1 Fees
Fees consist of:
- A monthly base subscription fee  
- Usage-based fees (e.g., per-minute call usage)  
- Card usage fees (e.g., if you use a card to pay for the service)
as specified in your Order.

### 6.2 Billing & Renewals
Subscriptions renew automatically unless canceled in accordance with your Order. Fees are charged via Stripe or another payment processor and stipe fees apply.

### 6.3 No Refunds
**All fees are non-refundable**, except where required by law.

### 6.4 Non-Payment
Failure to pay may result in suspension or termination of Service.

---

## 7. WARRANTIES & DISCLAIMERS

THE SERVICE IS PROVIDED **“AS IS” AND “AS AVAILABLE.”** VIMPOUND DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND ACCURACY.

AI-generated outputs may contain errors and must not be relied upon without human verification.

---

## 8. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW, VIMPOUND SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

VIMPOUND’S TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO VIMPOUND IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

---

## 9. INDEMNIFICATION

You agree to indemnify and hold harmless Vimpound from any claims arising out of:
- Your use of the Service  
- Your violation of law  
- Your failure to obtain required call-recording consent  

---

## 10. TERM & TERMINATION

Either party may terminate in accordance with the Order. Upon termination, your right to use the Service ceases, but data-use, payment, limitation-of-liability, and indemnification provisions survive.

---

## 11. GOVERNING LAW & DISPUTE RESOLUTION

These Terms are governed by the laws of the **State of Delaware**, without regard to conflict-of-laws rules.

Any dispute shall be resolved by **binding arbitration** administered by JAMS in Delaware. **Class actions and jury trials are waived.**

---

## 12. MISCELLANEOUS

- Notices may be provided electronically  
- Vimpound may assign these Terms in connection with a merger or sale  
- If any provision is unenforceable, the remainder remains in effect  
- These Terms constitute the entire agreement between the parties  

---

 2026 Vimpound AI. All rights reserved.


`

export default function Terms() {
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
