'use client';

import { useTranslation } from "@/context/i18n-context";
import { StructuredData } from "@/components/structured-data";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Privacy Policy", url: "/privacy" }
  ];

  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - Nomaryth",
    "description": "Privacy Policy for Nomaryth website. Learn how we collect, use, and protect your personal information.",
    "url": "https://gghorizon.com/privacy",
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
      <StructuredData data={privacySchema} />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold font-headline text-primary mb-8">
            Privacy Policy
          </h1>
          
          <p className="text-muted-foreground mb-6">
            <strong>Last updated:</strong> January 15, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              subscribe to our newsletter, or contact us for support.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (name, email address)</li>
              <li>Profile information and preferences</li>
              <li>Communication history with our support team</li>
              <li>Usage data and analytics information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to provide, maintain, and improve our services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and maintain our website and services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              3. Information Sharing
            </h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy.
            </p>
            <p className="text-muted-foreground">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>With your consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist in our operations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              4. Data Security
            </h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p className="text-muted-foreground">
              However, no method of transmission over the internet or electronic storage is 100% secure, 
              so we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              5. Cookies and Tracking
            </h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our website:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Essential cookies:</strong> Required for basic website functionality</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site</li>
              <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              6. Your Rights
            </h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              7. Children's Privacy
            </h2>
            <p className="text-muted-foreground">
              Our services are not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you are a parent or guardian and 
              believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              8. Changes to This Policy
            </h2>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              9. Contact Us
            </h2>
            <p className="text-muted-foreground">
              If you have any questions about this privacy policy, please contact us at:
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