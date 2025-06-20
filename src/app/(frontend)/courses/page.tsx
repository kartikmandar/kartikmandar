import type { Metadata } from 'next/types'
import React from 'react'
import { 
  ExternalLink
} from 'lucide-react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Courses | Kartik Mandar - Academic Journey',
    description: 'Comprehensive academic coursework in physics, mathematics, engineering, economics, and related fields at IISER Bhopal.',
    openGraph: {
      title: 'Courses - Kartik Mandar',
      description: 'Academic coursework spanning physics, mathematics, engineering, and interdisciplinary studies.',
    },
  }
}

export default async function CoursesPage(): Promise<React.JSX.Element> {
  const courseCategories = [
    {
      category: "Physics Courses",
      color: "from-blue-500/20 to-purple-500/20 border-blue-500/30",
      courses: [
        { title: "PHY101 Mechanics", credits: 3, url: null },
        { title: "PHY106 Quantum Physics", credits: 3, url: null },
        { title: "PHY201 Waves and Optics", credits: 3, url: null },
        { title: "PHY209 Electromagnetism", credits: 3, url: null },
        { title: "PHY206 Physics Through Computational Thinking", credits: 3, url: null },
        { title: "PHY208 General Properties of Matter", credits: 3, url: null },
        { title: "PHY301 Mathematical Methods I", credits: 4, url: null },
        { title: "PHY303 Introduction to Quantum Mechanics", credits: 4, url: null },
        { title: "PHY305 Classical Mechanics", credits: 4, url: null },
        { title: "PHY309 Thermal Physics", credits: 4, url: null },
        { title: "PHY311 Basic Electronics", credits: 3, url: null },
        { title: "PHY302 Mathematical Methods II", credits: 4, url: null },
        { title: "PHY304 Advanced Quantum Mechanics", credits: 4, url: null },
        { title: "PHY306 Statistical Mechanics", credits: 4, url: null },
        { title: "PHY312 Numerical Methods and Programming", credits: 4, url: null },
        { title: "PHY314 Introduction to Special Relativity", credits: 3, url: null },
        { title: "PHY402 Atomic and Molecular Physics", credits: 4, url: null },
        { title: "PHY403 Condensed Matter Physics", credits: 4, url: null },
        { title: "PHY404 Nuclear and Particle Physics", credits: 4, url: null },
        { title: "PHY407 Electrodynamics", credits: 4, url: null },
        { title: "PHY616 General Theory of Relativity", credits: 4, url: null },
        { title: "PHY625 Quantum Information Theory", credits: 4, url: null },
        { title: "PHY633 Introduction to Astronomy and Astrophysics", credits: 4, url: null }
      ]
    },
    {
      category: "Physics Labs and Reports",
      color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
      courses: [
        { title: "PHY103 General Physics Laboratory I", credits: 1, url: null },
        { title: "PHY205 General Physics Laboratory II", credits: 1, url: null },
        { title: "PHY210 General Physics Laboratory III", credits: 1, url: null },
        { title: "PHY307 Physics Laboratory I", credits: 3, url: null },
        { title: "PHY308 Physics Laboratory II", credits: 3, url: null },
        { title: "PHY405 Condensed Matter Physics Laboratory", credits: 3, url: null },
        { title: "PHY406 Nuclear Lab", credits: 3, url: null }
      ]
    },
    {
      category: "Maths Courses",
      color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
      courses: [
        { title: "MTH101 Calculus of One Variable", credits: 3, url: null },
        { title: "MTH102 Linear Algebra", credits: 3, url: null },
        { title: "MTH201 Multivariable Calculus", credits: 3, url: null },
        { title: "MTH203 Introduction to Groups and Symmetry", credits: 3, url: null },
        { title: "MTH202 Probability and Statistics", credits: 3, url: null },
        { title: "MTH204 Complex Variables", credits: 3, url: null }
      ]
    },
    {
      category: "Engineering Courses",
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
      courses: [
        { title: "CHE103 Engineering Design and Drawing", credits: 3, url: null },
        { title: "ECS102 Introduction to Programming", credits: 3, url: null },
        { title: "ECS201 Discrete Mathematics I", credits: 3, url: null },
        { title: "ECS202 Data Structures and Algorithms", credits: 3, url: null },
        { title: "ECS204 Signals and Systems", credits: 3, url: null },
        { title: "ECS672 Electromagnetic Theory", credits: 4, url: null }
      ]
    },
    {
      category: "Economic Courses",
      color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
      courses: [
        { title: "ECO101 Principles of Economics I", credits: 3, url: null },
        { title: "ECO102 Principles of Economics II", credits: 3, url: null },
        { title: "ECO201 Econometrics I", credits: 4, url: null }
      ]
    },
    {
      category: "Other Courses and Labs",
      color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30",
      courses: [
        { title: "BIO101 Biology I: Biomolecules", credits: 3, url: null },
        { title: "BIO102 Biology II: Fundamentals of Cell Biology", credits: 3, url: null },
        { title: "BIO103 General Biology Laboratory", credits: 1, url: null },
        { title: "CHM101 General Chemistry", credits: 3, url: null },
        { title: "CHM112 Basic Organic Chemistry I", credits: 3, url: null },
        { title: "CHM114 Chemistry Laboratory I", credits: 1, url: null },
        { title: "EES101 Earth Materials and Processes", credits: 3, url: null },
        { title: "EES102 Introduction to Environmental Sciences", credits: 3, url: null },
        { title: "HSS101 English for Communication", credits: 2, url: null },
        { title: "IPR500 Law Relating to Intellectual Property and Patents", credits: 1, url: null },
        { title: "PT101 Physical Training", credits: 0, url: null }
      ]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Courses and Labs
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Comprehensive academic coursework spanning physics, mathematics, engineering, economics, and interdisciplinary studies at IISER Bhopal.
          </p>
        </div>

        {/* Courses by Category */}
        {courseCategories.map((categoryData, categoryIndex) => (
          <section key={categoryIndex} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-foreground">{categoryData.category}</h2>
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {categoryData.courses.length} course{categoryData.courses.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryData.courses.map((course, courseIndex) => (
                <div 
                  key={`${categoryIndex}-${courseIndex}`} 
                  className={`bg-gradient-to-br ${categoryData.color} bg-card border rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg group flex flex-col`}
                >
                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-2 text-foreground line-clamp-2 flex-1">
                      {course.title}
                    </h3>
                    <div className="mb-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {course.credits} {course.credits === 1 ? 'Credit' : 'Credits'}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border border-muted-foreground/20">
                        UG IISERB
                      </span>
                    </div>
                    
                    {/* View Button */}
                    {course.url ? (
                      <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </a>
                    ) : (
                      <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed">
                        <ExternalLink className="w-4 h-4" />
                        View
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Summary Stats */}
        <section className="mt-16 pt-8 border-t border-border">
          <div className="grid md:grid-cols-3 gap-6 text-center max-w-2xl mx-auto">
            <div className="bg-card border rounded-lg p-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {courseCategories.reduce((total, cat) => total + cat.courses.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Courses</div>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="text-3xl font-bold text-primary mb-2">{courseCategories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="text-3xl font-bold text-primary mb-2">
                {courseCategories.filter(cat => cat.category.includes('Lab')).reduce((total, cat) => total + cat.courses.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Lab Courses</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}