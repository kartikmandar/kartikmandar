import type { Metadata } from 'next/types'
import React from 'react'
import Link from 'next/link'
import PageClient from './page.client'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Scientific Software Consultancy | Kartik Mandar - Astrophysics & Data Visualization',
    description: 'Expert consultancy in scientific software development, astrophysical data visualization, machine learning for research, and custom web applications for research institutions.',
    openGraph: {
      title: 'Scientific Software Consultancy - Kartik Mandar',
      description: 'Specialized in scientific data visualization, ML for astrophysics, and research software development.',
    },
  }
}

export default async function ConsultancyPage() {
  const services = [
    {
      title: "Scientific Data Visualization",
      description: "Interactive dashboards and 3D visualizations for astronomical data and real-time monitoring systems.",
      features: [
        "Interactive astronomy data dashboards",
        "3D astronomical visualizations using Three.js",
        "Real-time telescope/experiment monitoring",
        "Custom plots",
        "Publication-ready visualizations"
      ]
    },
    {
      title: "Web Applications for Research Institutes", 
      description: "Modern, professional websites and web applications tailored for research institutions, scientists, and academic departments.",
      features: [
        "Research institute websites",
        "Department/lab websites",
        "Conference and event websites",
        "Data collection/ survey apps"     
      ]
    },
    {
      title: "Mobile Applications for Scientific Projects",
      description: "Native and cross-platform mobile apps designed for field research, data collection, and real-time scientific monitoring.",
      features: [
        "Field data collection apps",
        "Offline-first research tools",
        "Real-time experiment monitoring",
        "Research collaboration apps"
      ]
    }
  ]


  const process = [
    {
      step: "1",
      title: "Discovery & Requirements",
      description: "Deep dive into your research needs, data sources, and desired outcomes.",
      duration: "1-2 weeks"
    },
    {
      step: "2", 
      title: "Technical Architecture",
      description: "Design scalable solutions that integrate with your existing research workflow.",
      duration: "1 week"
    },
    {
      step: "3",
      title: "Development & Testing", 
      description: "Agile development with regular check-ins and scientific accuracy validation.",
      duration: "4-12 weeks"
    },
    {
      step: "4",
      title: "Deployment & Training",
      description: "Production deployment with comprehensive training for your team.",
      duration: "1-2 weeks"
    },
    {
      step: "5",
      title: "Support & Maintenance",
      description: "Ongoing support, updates, and feature enhancements as needed.",
      duration: "Ongoing"
    }
  ]

  return (
    <>
      <PageClient />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
              Scientific Software Consultancy
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
              Specialized in data visualization, app and web development, machine learning application for astrophysics, cloud deployments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#services" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Explore Services
              </a>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-card border border-border text-card-foreground font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>

          {/* Unique Value Proposition */}
          <div className="mb-16">
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-foreground text-center">Why Choose Scientific-First Development?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-2 text-foreground">Domain Expertise</h3>
                  <p className="text-muted-foreground text-sm">Understanding of astrophysics, research workflows, and scientific data requirements.</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-2 text-foreground">Modern Technology</h3>
                  <p className="text-muted-foreground text-sm">Always experimenting with modern stacks, so you would have the option to go either with the tried and tested or chose the upcoming stack.</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-2 text-foreground">Research-Focused</h3>
                  <p className="text-muted-foreground text-sm">Solutions designed specifically for research institutions by a budding astrophyscist himself.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <section id="services" className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Services & Solutions</h2>
            <div className="grid md:grid-cols-2 gap-8 justify-items-center max-w-4xl mx-auto [&>*:nth-child(odd):last-child]:md:col-span-2 [&>*:nth-child(odd):last-child]:md:max-w-md">
              {services.map((service, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-foreground">Key Features:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-primary">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>


                </div>
              ))}
            </div>
          </section>


          {/* Process Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Development Process</h2>
            <div className="space-y-6">
              {process.map((phase, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {phase.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{phase.title}</h3>
                      <span className="text-sm text-muted-foreground">{phase.duration}</span>
                    </div>
                    <p className="text-muted-foreground">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>


          {/* Pricing Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Hourly Rates & Pricing</h2>
            <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Scientific Data Visualization */}
              <div className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Scientific Data Visualization</h3>
                  <div className="text-3xl font-bold text-foreground mb-2">$30/hr</div>
                  <p className="text-muted-foreground text-sm">Interactive dashboards & 3D visualizations</p>
                </div>
              </div>

              {/* Web Applications */}
              <div className="bg-card border-2 border-primary rounded-lg p-6 hover:bg-accent/50 transition-colors relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">Most Popular</span>
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Web Applications</h3>
                  <div className="text-3xl font-bold text-foreground mb-2">$25/hr</div>
                  <p className="text-muted-foreground text-sm">Research institute websites & apps</p>
                </div>
              </div>

              {/* Mobile Applications */}
              <div className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Mobile Applications</h3>
                  <div className="text-3xl font-bold text-foreground mb-2">$35/hr</div>
                  <p className="text-muted-foreground text-sm">iOS, Android & cross-platform apps</p>
                </div>
              </div>

              {/* Custom Solutions */}
              <div className="bg-card border border-border rounded-lg p-6 hover:bg-accent/50 transition-colors">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Custom Solutions</h3>
                  <div className="text-3xl font-bold text-foreground mb-2">$40/hr</div>
                  <p className="text-muted-foreground text-sm">Complex specialized projects</p>
                </div>
              </div>
            </div>

            {/* Pricing Notes */}
            <div className="mt-8">
              <div className="bg-muted/50 rounded-lg p-4 max-w-3xl mx-auto">
                <h4 className="font-semibold mb-2 text-foreground text-left">Pricing Notes</h4>
                <div className="md:columns-2 md:gap-8 text-sm text-muted-foreground space-y-3">
                  <p className="break-inside-avoid">1. Minimum 10-hour engagement per project</p>
                  <p className="break-inside-avoid">2. 25% advance payment required to start</p>
                  <p className="break-inside-avoid">3. Bulk discounts available for 30+ hours</p>
                  <p className="break-inside-avoid">4. Free initial consultation (45 minutes)</p>
                  <p className="break-inside-avoid">5. Flexible rates for academic institutions</p>
                  <p className="break-inside-avoid">6. Weekly progress reports</p>
                  <p className="break-inside-avoid">7. Typical work day is 2hr / project / day</p>
                  <p className='break-inside-avoid'>8. Payments can be made by Paypal, Direct bank transfer or UPI</p>
                </div>
              </div>
            </div>
            
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Ready to Transform Your Research with Modern Software?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Schedule Consultation
                </Link>
                <Link
                  href="/developer"
                  className="inline-flex items-center justify-center px-8 py-4 bg-card border border-border text-card-foreground font-semibold rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  My Work
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}