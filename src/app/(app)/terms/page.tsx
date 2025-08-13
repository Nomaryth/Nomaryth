'use client';

import { useTranslation } from "@/context/i18n-context";
import { StructuredData } from "@/components/structured-data";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export default function TermsOfService() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Terms of Service", url: "/terms" }
  ];

  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service - Nomaryth",
    "description": "Terms of Service for Nomaryth website. Read our terms and conditions for using our services.",
    "url": "https://gghorizon.com/terms",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://gghorizon.com${item.url}`
      }))
    }
  };

  return (
    <>
      <StructuredData data={termsSchema} />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold font-headline text-primary mb-8">
            Terms of Service
          </h1>
          
          <p className="text-muted-foreground mb-6">
            <strong>Last updated:</strong> January 15, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing and using the Nomaryth website and services, you accept and agree to be bound 
              by the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              2. Use License
            </h2>
            <p className="text-muted-foreground mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) 
              on Nomaryth&apos;s website for personal, non-commercial transitory viewing only.
            </p>
            <p className="text-muted-foreground mb-4">
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              3. User Accounts
            </h2>
            <p className="text-muted-foreground mb-4">
              When you create an account with us, you must provide information that is accurate, complete, 
              and current at all times. You are responsible for safeguarding the password and for all activities 
              that occur under your account.
            </p>
            <p className="text-muted-foreground">
              You agree not to disclose your password to any third party and to take sole responsibility for 
              any activities or actions under your account, whether or not you have authorized such activities or actions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              4. Acceptable Use
            </h2>
            <p className="text-muted-foreground mb-4">
              You agree not to use the service to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload or transmit viruses or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              5. Intellectual Property
            </h2>
            <p className="text-muted-foreground mb-4">
              The service and its original content, features, and functionality are and will remain the 
              exclusive property of Nomaryth and its licensors. The service is protected by copyright, 
              trademark, and other laws.
            </p>
            <p className="text-muted-foreground">
              Our trademarks and trade dress may not be used in connection with any product or service 
              without our prior written consent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              6. User Content
            </h2>
            <p className="text-muted-foreground mb-4">
              You retain ownership of any content you submit, post, or display on or through the service. 
              By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, 
              reproduce, modify, and distribute your content.
            </p>
            <p className="text-muted-foreground">
              You represent and warrant that your content does not violate any third-party rights and 
              that you have all necessary permissions to grant us the license described above.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              7. Privacy Policy
            </h2>
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy, which also governs your 
              use of the service, to understand our practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              8. Disclaimers
            </h2>
            <p className="text-muted-foreground mb-4">
              The materials on Nomaryth&apos;s website are provided on an &apos;as is&apos; basis. Nomaryth makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other warranties 
              including without limitation, implied warranties or conditions of merchantability, fitness 
              for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="text-muted-foreground">
              Further, Nomaryth does not warrant or make any representations concerning the accuracy, 
              likely results, or reliability of the use of the materials on its website or otherwise 
              relating to such materials or on any sites linked to this site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              9. Limitations
            </h2>
            <p className="text-muted-foreground">
              In no event shall Nomaryth or its suppliers be liable for any damages (including, without 
              limitation, damages for loss of data or profit, or due to business interruption) arising 
              out of the use or inability to use the materials on Nomaryth&apos;s website, even if Nomaryth 
              or a Nomaryth authorized representative has been notified orally or in writing of the 
              possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              10. Termination
            </h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account and bar access to the service immediately, without 
              prior notice or liability, under our sole discretion, for any reason whatsoever and without 
              limitation, including but not limited to a breach of the Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              11. Governing Law
            </h2>
            <p className="text-muted-foreground">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which 
              Nomaryth operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              12. Changes to Terms
            </h2>
            <p className="text-muted-foreground">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material, we will try to provide at least 30 days notice prior to any new 
              terms taking effect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              13. Contact Information
            </h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-card border rounded-lg">
              <p className="text-muted-foreground">
                <strong>Email:</strong> contact@nomaryth.uk<br />
                <strong>Address:</strong> Nomaryth Team<br />
                <strong>Website:</strong> https://gghorizon.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
} 