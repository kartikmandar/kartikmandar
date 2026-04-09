import type { Metadata } from 'next/types'
import React from 'react'
import {
  ExternalLink
} from 'lucide-react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Certificates | Kartik Mandar - Professional Development',
    description: 'Professional certificates and achievements in machine learning, data science, web development, and academic research.',
    openGraph: {
      title: 'Certificates - Kartik Mandar',
      description: 'Professional certificates in ML, data science, web development, and research.',
    },
  }
}

export default async function CertificatesPage(): Promise<React.JSX.Element> {
  const certificates = [
    {
      title: "Advanced Learning Algorithms",
      issuer: "Andrew Ng - Coursera",
      category: "Machine Learning",
      description: "Advanced machine learning techniques including neural networks, deep learning, and optimization algorithms.",
      certificateUrl: "https://drive.google.com/file/d/1PcroWbFBzukGOiG9UgFCReaXvwHrjPKV/view?usp=sharing"
    },
    {
      title: "Supervised Machine Learning: Regression and Classification",
      issuer: "Andrew Ng - Coursera",
      category: "Machine Learning",
      description: "Fundamental supervised learning algorithms including linear regression, logistic regression, and classification techniques.",
      certificateUrl: "https://drive.google.com/file/d/1HTwhW386f0Oggw4YBfFhcySSiC-O0ey4/view?usp=sharing"
    },
    {
      title: "Heliodyssey",
      issuer: "Space Research Competition",
      category: "Astronomy",
      description: "Certificate for participation in space research and astronomy competition.",
      certificateUrl: "https://drive.google.com/file/d/1dSc4QChMadlOvUtds_5DdnC9sPiUR1P8/view?usp=sharing"
    },
    {
      title: "IISER Bhopal Astronomy Club",
      issuer: "IISER Bhopal",
      category: "Astronomy",
      description: "Active participation and contribution to astronomy club activities and research.",
      certificateUrl: "https://drive.google.com/file/d/17yLOl6RB8qSAfKJo0coyfsgRLfaZCs0D/view?usp=sharing"
    },
    {
      title: "Summer Analytics 24",
      issuer: "IIT Guwahati",
      category: "Data Science",
      description: "Intensive summer program in analytics and data science methodologies.",
      certificateUrl: "https://drive.google.com/file/d/1C2nKmbivvmObLVSNItou5ebA2CTFq9ys/view?usp=sharing"
    },
    {
      title: "AICTE - Mathworks - Internship",
      issuer: "AICTE & MathWorks",
      category: "Technical",
      description: "Professional internship program in technical computing and engineering applications.",
      certificateUrl: "https://drive.google.com/file/d/1SbPWRhKFmadL7onLpz_5e3aNtpBwXS3u/view?usp=sharing"
    },
    {
      title: "Science Rendezvous 2023: Webmaster Certificate",
      issuer: "Science Rendezvous",
      category: "Web Development",
      description: "Webmaster certificate for managing and developing web platforms for scientific events.",
      certificateUrl: "https://drive.google.com/file/d/1Q0gmBHNFweyTHBFkpy9BvJ4SVhSy5Sf5/view?usp=sharing"
    },
    {
      title: "Mobile Sensor Data Collection App",
      issuer: "Internship Program",
      category: "Mobile Development",
      description: "Internship focused on developing mobile applications for sensor data collection and analysis.",
      certificateUrl: "https://drive.google.com/file/d/12heHcJyQIDzEO8ffAMtHIMKAL8_WO7Pq/view?usp=sharing"
    },
    {
      title: "Soft Skill Workshop",
      issuer: "Professional Development",
      category: "Professional Skills",
      description: "Workshop on communication, leadership, and interpersonal skills development.",
      certificateUrl: "https://drive.google.com/file/d/1dnqt2m_rW28TXGb8WTeniurQ64A91UAO/view?usp=sharing"
    },
    {
      title: "MATLAB Onramp",
      issuer: "MathWorks",
      category: "Programming",
      description: "Proficiency in MATLAB for technical computing, data analysis, and algorithm development.",
      certificateUrl: "https://drive.google.com/file/d/1P54Nvg_ysm5ZIB2mDixzognfwTIK-IFO/view?usp=sharing"
    },
    {
      title: "MATLAB Signal Processing Onramp",
      issuer: "MathWorks",
      category: "Programming",
      description: "Signal processing techniques and applications using MATLAB.",
      certificateUrl: "https://drive.google.com/file/d/1_hCdiLHPhEcNjqJ02ynyGq5PWfyyalZQ/view?usp=sharing"
    },
    {
      title: "MATLAB Image Processing Onramp",
      issuer: "MathWorks",
      category: "Programming",
      description: "Image processing and computer vision techniques using MATLAB.",
      certificateUrl: "https://drive.google.com/file/d/1QHLM-jslPzxZyQGuy2b3hXr7nZNIxYaM/view?usp=sharing"
    },
    {
      title: "MATLAB Machine Learning Onramp",
      issuer: "MathWorks",
      category: "Programming",
      description: "Machine learning algorithms and techniques using MATLAB.",
      certificateUrl: "https://drive.google.com/file/d/12ADT_d6NEiQh3WcQdE3qpNk9beGgBlqi/view?usp=sharing"
    },
    {
      title: "MATLAB Deep Learning Onramp",
      issuer: "MathWorks",
      category: "Programming",
      description: "Deep learning fundamentals and neural networks using MATLAB.",
      certificateUrl: "https://drive.google.com/file/d/1Zd-k-4MmaCUzt6K4jzDIUFcFzrgF6Ubh/view?usp=sharing"
    },
    {
      title: "Introduction to SQL",
      issuer: "Database Training",
      category: "Database",
      description: "Fundamentals of SQL database management and query optimization.",
      certificateUrl: "https://drive.google.com/file/d/1y6tu8mn-ZcUvpiQy6xBxKFsnl5kjRZYk/view?usp=sharing"
    },
    {
      title: "Introduction to Git",
      issuer: "Version Control",
      category: "Development Tools",
      description: "Version control fundamentals and collaborative development with Git.",
      certificateUrl: "https://drive.google.com/file/d/1E_VxGc-2sTFbOQzkIG9bQoxpMj65lNvA/view?usp=sharing"
    },
    {
      title: "Responsive Web Design",
      issuer: "FreeCodeCamp",
      category: "Web Development",
      description: "Modern responsive web design principles and implementation techniques.",
      certificateUrl: "https://drive.google.com/file/d/1qy5BPiL0uAT9Q9N-dH7gpStns_gqk91-/view?usp=sharing"
    },
    {
      title: "Python",
      issuer: "Programming Certification",
      category: "Programming",
      description: "Python programming fundamentals and advanced concepts for data science and development.",
      certificateUrl: "https://drive.google.com/file/d/1HJqjidRzmU1VGXwWCflE0vVk30IMmX8q/view?usp=sharing"
    },
    {
      title: "Learning How to Learn",
      issuer: "Educational Course",
      category: "Learning Skills",
      description: "Meta-learning techniques and strategies for effective learning and knowledge retention.",
      certificateUrl: "https://drive.google.com/file/d/14X6MPcqGvXgNvPWSYBRBsBRoU7vZMO1A/view?usp=sharing"
    },
    {
      title: "Learn Enough Command Line to Be Dangerous",
      issuer: "Learn Enough",
      category: "Development",
      description: "Command line fundamentals and essential terminal skills for developers.",
      certificateUrl: "https://www.learnenough.com/certificates/kartikmandar/command-line-tutorial"
    },
    {
      title: "Learn Enough Text Editor to Be Dangerous",
      issuer: "Learn Enough",
      category: "Development",
      description: "Text editor proficiency and efficient code editing techniques.",
      certificateUrl: "https://www.learnenough.com/certificates/kartikmandar/text-editor-tutorial"
    },
    {
      title: "Learn Enough Git to Be Dangerous",
      issuer: "Learn Enough",
      category: "Development",
      description: "Git version control fundamentals for collaborative development.",
      certificateUrl: "https://www.learnenough.com/certificates/kartikmandar/git-tutorial"
    },
    {
      title: "Learn Enough HTML to Be Dangerous",
      issuer: "Learn Enough",
      category: "Development",
      description: "HTML fundamentals and web markup best practices.",
      certificateUrl: "https://www.learnenough.com/certificates/kartikmandar/html-tutorial"
    },
    {
      title: "Server Management",
      issuer: "System Administration",
      category: "DevOps",
      description: "Server administration, deployment, and infrastructure management.",
      certificateUrl: "https://drive.google.com/file/d/1u8Bhofr1hLkjv0dxGq9pydyZPW_BYVIM/view?usp=sharing"
    },
    {
      title: "Web Development",
      issuer: "Full Stack Development",
      category: "Web Development",
      description: "Comprehensive web development covering frontend and backend technologies.",
      certificateUrl: "https://drive.google.com/file/d/1ekhI8D7FON7ATc5_ODCIa8K33FqTBSxC/view?usp=sharing"
    }
  ]

  // Group certificates by category
  const groupedCertificates = certificates.reduce((acc, cert) => {
    if (!acc[cert.category]) {
      acc[cert.category] = []
    }
    acc[cert.category]!.push(cert)
    return acc
  }, {} as Record<string, typeof certificates>)

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-5xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Certificates
          </h1>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Here are some certificates to look at I guess.
          </p>
        </div>

        {/* Certificates by Category */}
        {Object.entries(groupedCertificates).map(([category, certs]) => (
          <section key={category} id={category.replace(/\s+/g, '-')} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-foreground">{category}</h2>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {certs.length} certificate{certs.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certs.map((certificate, index) => (
                <div 
                  key={`${category}-${index}`} 
                  className="bg-card border border-border rounded-lg p-6 transition-colors hover:bg-accent/50 flex flex-col"
                >
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-2 text-foreground line-clamp-2">
                      {certificate.title}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-3">
                      {certificate.issuer}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4 flex-1">
                      {certificate.description}
                    </p>
                    
                    {/* View Certificate Button */}
                    {certificate.certificateUrl ? (
                      <a
                        href={certificate.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Certificate
                      </a>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed">
                        <ExternalLink className="w-4 h-4" />
                        View Certificate
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}


      </div>
    </div>
  )
}