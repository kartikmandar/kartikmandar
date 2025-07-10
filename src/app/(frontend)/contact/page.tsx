import type { Metadata } from 'next/types'
import React from 'react'
import Script from 'next/script'
import PageClient from './page.client'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact | Kartik Mandar - Astrophysics Student',
    description: 'Get in touch with Kartik Mandar for research collaborations, academic discussions, or schedule meetings about radio interferometry, BHXBs, and gravitational lensing projects.',
    openGraph: {
      title: 'Contact Kartik Mandar',
      description: 'Schedule meetings and connect for astrophysics research collaborations.',
    },
  }
}

export default async function ContactPage() {
  return (
    <>
      <PageClient />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
              Contact Me
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Let&apos;s connect for research collaborations, academic discussions, consultancy services, or to explore opportunities in astrophysics, data analysis or even a cool development project.
            </p>
          </div>

          {/* Contact Information Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Contact Information</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Institute */}
              <div className="flex gap-4 items-start p-4 bg-card rounded-lg border border-border">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Institute</h3>
                  <p className="text-muted-foreground text-sm">
                    Raman Research Institute<br />
                    Bangalore, Karnataka, India
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 items-start p-4 bg-card rounded-lg border border-border">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <a 
                    href="mailto:kartik4321mandar@gmail.com" 
                    className="text-primary hover:text-primary/80 transition-colors text-sm break-all"
                  >
                    kartik4321mandar@gmail.com
                  </a>
                </div>
              </div>

              {/* Meeting Hours */}
              <div className="flex gap-4 items-start p-4 bg-card rounded-lg border border-border">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Meeting Hours</h3>
                  <p className="text-muted-foreground text-sm">By appointment</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Use the calendar below to schedule</p>
                </div>
              </div>
            </div>
          </section>

          {/* Currently At Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Currently at</h2>
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">SKA India training workshop</h3>
                  <p className="text-muted-foreground">IIT Indore, India</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">7th - 18th July</p>
                </div>
              </div>
            </div>
          </section>

          {/* Schedule a Meeting Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Schedule a Meeting</h2>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/kartik4321mandar/consultancy-collaboration-meeting?hide_gdpr_banner=1" 
                style={{ minWidth: '320px', height: '1000px' }}
              ></div>
            </div>
          </section>

          {/* Alternative Google Calendar Section */}
          <section>
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between rounded-lg bg-card border border-border p-4 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                <h3 className="font-medium">Alternative: Google Calendar Booking</h3>
                <div className="ml-1.5 flex h-5 w-5 items-center justify-center">
                  <svg className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              <div className="mt-4 bg-card rounded-lg border border-border overflow-hidden">
                <iframe 
                  src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0Lshr4FrRM85aV6Khk9hbPQMlMlpG7o8KUkVgdQP1OyTJXHoN3SV2yNCuVpr4X-lAleU0ia34Q?gv=true&theme=dark" 
                  style={{ border: 0, colorScheme: 'light dark' }} 
                  width="100%" 
                  height="800" 
                  frameBorder="0"
                  title="Google Calendar - Schedule Meeting with Kartik Mandar"
                ></iframe>
              </div>
            </details>
          </section>
        </div>
      </div>
      
      {/* Calendly Script */}
      <Script 
        src="https://assets.calendly.com/assets/external/widget.js" 
        strategy="afterInteractive"
      />
    </>
  )
}