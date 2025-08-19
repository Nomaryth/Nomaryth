'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Character {
  id: string;
  name: string;
  image: string;
  description?: string;
  role?: string;
  faction?: string;
  level?: number;
}

interface CharacterShowcaseProps {
  className?: string;
}

export function CharacterShowcase({ className = "" }: CharacterShowcaseProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/admin/characters');
        if (response.ok) {
          const data = await response.json();
          setCharacters(data.characters || []);
        } else {
          console.error('Failed to fetch characters');
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  if (isLoading) {
    return (
      <section className={`py-16 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Character Showcase
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descubra os heróis que moldarão o destino de Nomaryth
            </p>
          </motion.div>

          <div className="character-showcase-container">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`character-box character-box-${index + 1} skeleton`}
              >
                <div className="character-info">
                  <div className="character-name skeleton-text"></div>
                  <div className="character-description skeleton-text"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          .character-showcase-container {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            gap: 1rem;
            width: 100%;
            max-width: 1200px;
            height: 500px;
            margin: 0 auto;
            transition: all 400ms ease;
          }

          .character-box {
            position: relative;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 12px;
            transition: all 400ms ease;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          }

          .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
          }

          .skeleton-text {
            height: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            margin-bottom: 8px;
          }

          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          @media (max-width: 1024px) {
            .character-showcase-container {
              grid-template-columns: 1fr 1fr 1fr;
              height: 400px;
              gap: 0.75rem;
            }
          }

          @media (max-width: 768px) {
            .character-showcase-container {
              grid-template-columns: 1fr 1fr;
              height: 300px;
              gap: 0.5rem;
            }
          }

          @media (max-width: 480px) {
            .character-showcase-container {
              grid-template-columns: 1fr;
              height: 250px;
            }
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Character Showcase
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra os heróis que moldarão o destino de Nomaryth
          </p>
        </motion.div>

        <div className="character-showcase-container">
          {characters.map((character, index) => (
            <div
              key={character.id}
              className={`character-box character-box-${index + 1}`}
              style={{ 
                backgroundImage: `url(${character.image})`
              }}
            >
              <div className="character-info">
                <h3 className="character-name">{character.name}</h3>
                {character.description && (
                  <p className="character-description">{character.description}</p>
                )}
                {character.role && (
                  <p className="character-role">{character.role}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-muted-foreground mb-6">
            Escolha seu caminho e escreva sua história
          </p>
          <motion.button
            className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explorar Personagens
          </motion.button>
        </motion.div>
      </div>

      <style jsx>{`
        .character-showcase-container {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
          gap: 1rem;
          width: 100%;
          max-width: 1200px;
          height: 500px;
          margin: 0 auto;
          transition: all 400ms ease;
        }

        .character-showcase-container:hover .character-box {
          filter: grayscale(100%) opacity(24%);
        }

        .character-box {
          position: relative;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 12px;
          transition: all 400ms ease;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .character-showcase-container .character-box:hover {
          filter: grayscale(0%) opacity(100%) !important;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
        }

        .character-showcase-container:has(.character-box-1:hover) {
          grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
        }

        .character-showcase-container:has(.character-box-2:hover) {
          grid-template-columns: 1fr 3fr 1fr 1fr 1fr;
        }

        .character-showcase-container:has(.character-box-3:hover) {
          grid-template-columns: 1fr 1fr 3fr 1fr 1fr;
        }

        .character-showcase-container:has(.character-box-4:hover) {
          grid-template-columns: 1fr 1fr 1fr 3fr 1fr;
        }

        .character-showcase-container:has(.character-box-5:hover) {
          grid-template-columns: 1fr 1fr 1fr 1fr 3fr;
        }

        .character-box:nth-child(odd) {
          transform: translateY(-16px);
        }

        .character-box:nth-child(even) {
          transform: translateY(16px);
        }

        .character-info {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.3) 50%,
            rgba(0, 0, 0, 0.8) 100%
          );
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 20px;
          opacity: 0;
          transition: all 400ms ease;
        }

        .character-box:hover .character-info {
          opacity: 1;
        }

        .character-name {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }

        .character-description {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          line-height: 1.4;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
          margin-bottom: 4px;
        }

        .character-role {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          font-style: italic;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        }
        
        @media (max-width: 1024px) {
          .character-showcase-container {
            grid-template-columns: 1fr 1fr 1fr;
            height: 400px;
            gap: 0.75rem;
          }
          
          .character-showcase-container:has(.character-box-1:hover),
          .character-showcase-container:has(.character-box-2:hover),
          .character-showcase-container:has(.character-box-3:hover) {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .character-showcase-container {
            grid-template-columns: 1fr 1fr;
            height: 300px;
            gap: 0.5rem;
          }
          
          .character-box:nth-child(odd),
          .character-box:nth-child(even) {
            transform: none;
          }
        }

        @media (max-width: 480px) {
          .character-showcase-container {
            grid-template-columns: 1fr;
            height: 250px;
          }
        }
      `}</style>
    </section>
  );
}
