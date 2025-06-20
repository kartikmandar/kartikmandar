import type { Metadata } from 'next/types'
import React from 'react'
import { 
  Telescope, 
  Zap, 
  Coffee, 
  Bike, 
  Keyboard, 
  FootprintsIcon 
} from 'lucide-react'

export const dynamic = 'force-static'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Hobbies | Kartik Mandar - Beyond Research',
    description: 'Discover the personal interests and hobbies that fuel creativity and passion - from stargazing and badminton to keyboards and cycling.',
    openGraph: {
      title: 'Hobbies - Kartik Mandar',
      description: 'Personal interests beyond astrophysics research - astronomy, sports, and more.',
    },
  }
}

export default async function HobbiesPage() {
  const hobbies = [
    {
      title: "Astronomy",
      description: "Love to gaze the stars and study why our cosmos is the way it is.",
      icon: <Telescope className="w-8 h-8" />,
      color: "from-blue-500/20 to-purple-500/20 border-blue-500/30"
    },
    {
      title: "Badminton", 
      description: "Playing and training since 11th class, I have played badminton competitively. I am currently playing for my college team.",
      icon: <Zap className="w-8 h-8" />,
      color: "from-green-500/20 to-emerald-500/20 border-green-500/30"
    },
    {
      title: "Green Tea",
      description: "A green tea addict. Favourite being the Organic India Tulsi-Mulethi.",
      icon: <Coffee className="w-8 h-8" />,
      color: "from-green-600/20 to-teal-500/20 border-green-600/30"
    },
    {
      title: "Cycling",
      description: "A proud road bike owner but still enjoy treks on MTB from time to time.",
      icon: <Bike className="w-8 h-8" />,
      color: "from-orange-500/20 to-red-500/20 border-orange-500/30"
    },
    {
      title: "Keyboards", 
      description: "Love keyboards, current fad is Royal Kludge 84 RGB 75% with Gaterons Yellow switches.",
      icon: <Keyboard className="w-8 h-8" />,
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30"
    },
    {
      title: "Running",
      description: "Running is more about the mind than the body.",
      icon: <FootprintsIcon className="w-8 h-8" />,
      color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/60">
            Hobbies
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Beyond the realm of astrophysics research, these passions and interests fuel creativity, provide balance, and keep life interesting.
          </p>
        </div>

        {/* Hobbies Grid */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hobbies.map((hobby, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${hobby.color} bg-card border rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg`}
              >
                {/* Content */}
                <div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {hobby.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {hobby.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>



      </div>
    </div>
  )
}