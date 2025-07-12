import type { Metadata } from 'next/types'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Github, Globe, Calendar } from 'lucide-react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'GSoC 2024 Final Report - Stingray Explorer | Kartik Mandar',
    description: 'Final report for Google Summer of Code 2024 project: A Quicklook Dashboard for X-ray Astronomy with Stingray',
    openGraph: {
      title: 'GSoC 2024 Final Report - Stingray Explorer',
      description: 'Building an interactive dashboard for X-ray astronomy analysis with the Stingray library',
    },
  }
}

export default function GSoC2024FinalReport(): React.JSX.Element {
  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 mb-6">
            GSoC 2024 Final Report
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Stingray Explorer
          </h2>
          <p className="text-xl text-muted-foreground">
            A Quicklook Dashboard for X-ray Astronomy with Stingray
          </p>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Calendar className="w-4 h-4" />
          <span>Last updated: September 2024</span>
        </div>

        {/* Project Info Bar */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6 mb-12">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Organization:</span>
              <p className="font-semibold">Open Astronomy</p>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <p className="font-semibold">May - September 2024</p>
            </div>
            <div>
              <span className="text-muted-foreground">Mentors:</span>
              <p className="font-semibold">Prof. Matteo Bachetti, Dr. Guglielmo Mastroserio</p>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          
          {/* Project Summary */}
          <section>
            <h3 className="text-2xl font-bold mb-4">
              1. Project Summary
            </h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                This proposal outlines the development of an innovative dashboard utilizing the Stingray library for X-ray astronomy analysis. 
                The Quicklook Dashboard aims to facilitate the exploration of astronomical data by providing interactive tools for the visualization 
                of light curves, periodograms, spectral colors etc. This project would make it much simpler for astronomers to focus on the problem 
                at hand and reading the results of the data analysis techniques (of Stingray) and not go on to input one command after another. 
                It would reduce the time invested in making the analysis work and even who are novice to command line tools to gain the benefits of Stingray.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                The proposed solution involves creating a web-based dashboard that streamlines the process of data visualization and analysis. 
                The dashboard will have predefined (parameter can be edited by users) functions that users can choose to analyse the data and 
                get the required plots in the dashboard itself. The aim is also to educate novice users/ UG-PG students to get to know about 
                how the analysis is being done. Technologies used are: python, flask, bokeh, holoviz, HTML/TailwindCSS, vanillaJS/React.JS 
                If time permits, the project is open to make it the start for an interactive analysis interface.
              </p>
            </div>
            
            {/* Technologies */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {["Python", "CSS", "Stingray API", "Holoviz ecosystem", "HoloViews", "Hvplot", "Panel", "Datashader"].map((tech) => (
                  <span key={tech} className="px-3 py-1 bg-muted rounded-full text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="mt-4">
              <h4 className="font-semibold mb-3">Topics</h4>
              <div className="flex flex-wrap gap-2">
                {["Data Visualization", "X-ray Analysis", "Interactive Plots", "Dashboard for Stingray"].map((topic) => (
                  <span key={topic} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* What I Did */}
          <section>
            <h3 className="text-2xl font-bold mb-4">
              2. What I Did
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Developed Modules for QuickLook Analysis:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Implemented modules for generating and visualising light curves, power spectra, cross-spectra, and averaged power and cross-spectra.</li>
                  <li>Created interactive widgets for parameter selection (e.g., dt, normalisation, segment size).</li>
                  <li>Integrated Stingray functions for data processing with HoloViews and Panel for visualisation.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Interactive Dashboard:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Designed a sidebar for easy navigation between different analysis tools.</li>
                  <li>Implemented floating panels to allow for flexible and customisable visual outputs.</li>
                  <li>Developed functionality for combining plots and displaying them in a unified view.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Error Handling and User Feedback:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Added robust error handling to provide clear feedback when invalid parameters are chosen.</li>
                  <li>Ensured that users are informed about the success or failure of operations through the output box.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Built with Stingray:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Utilised Stingray&apos;s core functionalities for creating light curves and power spectra.</li>
                </ul>
              </div>
            </div>

            {/* Dashboard Screenshots */}
            <div className="mt-8 space-y-6">
              <h4 className="font-semibold text-center">Dashboard Screenshots</h4>
              
              {/* Homepage Screenshot */}
              <div className="space-y-4">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src="/dashboard_homepage.png"
                    alt="Dashboard Homepage"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">Home Page of the Dashboard</p>
              </div>

              {/* Additional Screenshots Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 w-full">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src="/dashboard1.png"
                      alt="Dashboard Feature 1"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src="/dashboard2.png"
                      alt="Dashboard Feature 2"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src="/dashboard3.png"
                      alt="Dashboard Feature 3"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src="/dashboard4.png"
                      alt="Dashboard Feature 4"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-center">
                  <div className="space-y-2 w-full md:max-w-[50%]">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                      <Image
                        src="/dashboard5.png"
                        alt="Dashboard Feature 5"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-center text-muted-foreground">Some more pictures of the current dashboard</p>
            </div>
          </section>

          {/* Current State */}
          <section>
            <h3 className="text-2xl font-bold mb-4">3. Current State</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Completed Modules:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Light Curve Analysis</li>
                  <li>Power Spectrum Analysis</li>
                  <li>Cross-Spectrum Analysis</li>
                  <li>Averaged Power Spectrum Analysis</li>
                  <li>Averaged Cross-Spectrum Analysis</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Features:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Real-time interactive data analysis with Stingray.</li>
                  <li>Floating panels for modular and flexible visualisation and are saved across layouts</li>
                  <li>Robust error handling and user feedback mechanisms.</li>
                  <li>All the containers are completely flexible and can be moved around or go fullscreen</li>
                  <li>The containers rearrangement saves state and can be reset with the reset button</li>
                  <li>Bokeh plots allow all the usual panning, zooming functionality</li>
                  <li>Warning handling and output boxes in each layout</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Project Repository */}
          <section>
            <h3 className="text-2xl font-bold mb-4">
              4. Project Repository
            </h3>
            <p className="text-muted-foreground mb-4">
              The code is available on GitHub, where all the modules are documented and can be extended by the community.
            </p>
            <p className="text-muted-foreground">
              The demo of the dashboard is also deployed at Hugging Face for new users to try out before installing locally.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <Link 
                href="https://github.com/StingraySoftware/StingrayExplorer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Github className="w-4 h-4" />
                View Repository
              </Link>
              <Link 
                href="#demo"
                className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Try Demo
              </Link>
            </div>
          </section>

          {/* What's Left to Do */}
          <section>
            <h3 className="text-2xl font-bold mb-4">5. What&apos;s Left to Do</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Enhance Visualisation Customisation:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Add more customisation options for plots (e.g., color schemes, plot styles).</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Additional Features:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Implement advanced spectral analysis tools.</li>
                  <li>Add more Fourier Methods for QuickLook</li>
                  <li>And then pave the way for a complete comprehensive analysis solution</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Documentation and Tutorials:</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Develop comprehensive user documentation.</li>
                  <li>Create video tutorials to help new users get started.</li>
                  <li>Develop unit tests to make the code more maintainable</li>
                  <li>Not only the documentation and help sections, add the actual science process behind the analysis in the dashboard itself</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Personal Reflections */}
          <section className="space-y-8">
            {/* Favourite Part */}
            <div>
              <h3 className="text-2xl font-bold mb-4">
                6. Favourite part of GSOC
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Favourite part was meeting all the mentors weekly and discussing all about the project and the nitty gritty details 
                one is facing during the project. They are literally experts in the field and give apt guidance and clarity that I needed. 
                Because when you are facing bugs everyday and struggling with the implementation, an expert outer perspective helps a ton. 
                Also, the Stingray Project I was working on, my mentor was one of the creators for it. So ofc I could ask for any help that I needed.
              </p>
            </div>

            {/* Most Challenging Part */}
            <div>
              <h3 className="text-2xl font-bold mb-4">
                7. Most challenging part of GSOC
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                The most challenging part was the first weeks, when I just starting with the documentation because you know nothing about 
                the codebase, you are literally trying to understand it for the very first time. You don&apos;t yet know that you will get to 
                understand everything and would you be able to implement what you had planned, it&apos;s a mystery. It&apos;s confusing but when you 
                get out of that phase it becomes much easier and you gain momentum.
              </p>
            </div>

            {/* How GSOC Improved Skills */}
            <div>
              <h3 className="text-2xl font-bold mb-4">8. How GSOC improved my skills</h3>
              <p className="text-muted-foreground leading-relaxed">
                It&apos;s one thing to learn about buzz words like OOP and declarative programming in theory but another to actually implementing 
                them in practice. I actually gained real world experience on how to make deployment ready software. What are the good practices 
                that one should follow! What all things one needs to learn about when working in big orgs? How they interact and what the 
                hierarchy of structure is. I also got really good at reading through code and getting to the exact point that I needed.
              </p>
            </div>

            {/* Advice for Future Contributors */}
            <div>
              <h3 className="text-2xl font-bold mb-4">9. Advice for future contributors</h3>
              <p className="text-muted-foreground leading-relaxed">
                I would strongly recommend everyone to try for GSOC. And even if they didn&apos;t get in, at least try to work in an open source 
                project. The amount of things you can learn working in such projects is phenomenal. And no courses and youtube videos would 
                teach you that. Also don&apos;t do it for the sake of doing it. If you really like the project then only go for it. Because if 
                you don&apos;t really like the project then you will quickly lose interest.
              </p>
            </div>

            {/* Blog Link */}
            <div>
              <h3 className="text-2xl font-bold mb-4">10. Last but not the least</h3>
              <p className="text-muted-foreground mb-4">
                I am in love with Open Source, also yeah here is my GSOC blog.
              </p>
              <Link 
                href="https://gsoc2024.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Visit my GSoC Blog <ExternalLink className="w-4 h-4" />
              </Link>
            </div>

            {/* Demo Section */}
            <div id="demo">
              <h3 className="text-2xl font-bold mb-4">11. Demo for the Dashboard</h3>
              <p className="text-muted-foreground mb-6">
                Demo for the Dashboard deployed at Hugging Face. Watch the video demonstration below or try the live demo!
              </p>
              
              {/* YouTube Video Embed */}
              <div className="mb-8">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/G_-OyY3B1cA"
                    title="Stingray Explorer Dashboard Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
              
              {/* Hugging Face Link */}
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Try the interactive dashboard demo on Hugging Face:
                </p>
                <Link 
                  href="https://kartikmandar-stingrayexplorer.hf.space/explorer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Open Dashboard in Hugging Face <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t">
          <Link 
            href="/open-source"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Open Source Contributions
          </Link>
        </div>

      </div>
    </div>
  )
}