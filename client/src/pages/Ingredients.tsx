import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Ingredients() {
  const ingredientData = [
    {
      category: "Training Treats",
      products: [
        {
          name: "Bow-Wownies",
          ingredients: ["Beef liver", "banana", "eggs", "Greek yogurt", "oat flour"]
        },
        {
          name: "Pee-Nutz",
          ingredients: ["100% dog-friendly peanut butter", "oat flour", "eggs"]
        },
        {
          name: "Tuna Puffs",
          ingredients: ["Tuna in spring water", "flaxseed", "eggs", "oat flour", "love and care"]
        },
        {
          name: "Cheesy Bites",
          ingredients: ["Grated mozzarella cheese", "turmeric powder", "cider vinegar", "vegetable oil", "oat flour", "love and care"]
        }
      ]
    },
    {
      category: "Signature Treats",
      products: [
        {
          name: "Woofles (Grain-Free)",
          ingredients: ["Carrots", "chickpea (gram) flour", "turmeric", "cider vinegar", "eggs"]
        }
      ]
    },
    {
      category: "Celebration Treats",
      products: [
        {
          name: "Dognuts",
          ingredients: ["Mashed bananas", "eggs", "peanut butter", "Greek yogurt", "vegetable oil", "cider vinegar", "oat flour"],
          frosting: ["Dog-friendly icing (tapioca flour, rice flour)", "desiccated coconut"]
        },
        {
          name: "Petzza",
          ingredients: ["Minced chicken", "minced beef", "carrots", "spinach", "mozzarella cheese", "oat flour"],
          optional: ["Bacon (by request)"]
        }
      ]
    },
    {
      category: "Doggie Cakes",
      commonIngredients: {
        frosting: ["Plain cream cheese"],
        filling: ["Greek yogurt blended with peanut butter"]
      },
      products: [
        {
          name: "Banana & Peanut Butter",
          ingredients: ["Banana", "peanut butter", "Greek yogurt", "vegetable oil", "cider vinegar", "eggs", "oat flour"]
        },
        {
          name: "Apple & Carrots",
          ingredients: ["Apple", "carrots", "cider vinegar", "eggs", "oat flour"]
        },
        {
          name: "Chicken & Spinach",
          ingredients: ["Chicken breast", "spinach leaves", "cider vinegar", "eggs", "oat flour"]
        },
        {
          name: "Mince Beef & Beetroot",
          ingredients: ["Mince beef", "beetroot", "cider vinegar", "eggs", "oat flour"]
        }
      ]
    },
    {
      category: "Pupcakes",
      products: [
        {
          name: "Pupcakes",
          ingredients: ["Apple", "carrots", "cider vinegar", "eggs", "oat flour"],
          optional: ["Plain cream cheese (frosting)"]
        }
      ]
    },
    {
      category: "Seasonal Treat",
      products: [
        {
          name: "Gingerbread Hooman",
          ingredients: ["Oat flour", "ground ginger", "cinnamon", "honey", "vegetable oil"]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 sm:pt-32 lg:pt-36 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-accent mb-6">
              🥄 All Ingredients
            </h1>
            <p className="text-lg text-accent/70 max-w-3xl mx-auto">
              Complete transparency in every treat. We believe you should know exactly what goes into your dog's food, which is why we list every ingredient for every product we make.
            </p>
            
            {/* Important Note */}
            <div className="mt-8 bg-primary/10 border-2 border-primary/30 rounded-3xl p-6 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-accent mb-2">✅ Important Note</h3>
              <p className="text-accent/80">
                All treats (except the grain-free range) are made with <strong>100% oat flour</strong>. 
                Grain-free products use <strong>chickpea (gram) flour</strong> instead.
              </p>
            </div>
          </div>

          {/* Ingredients by Category */}
          <div className="space-y-12">
            {ingredientData.map((category, index) => (
              <div key={index} className="bg-white rounded-3xl border-2 border-border p-8 shadow-soft">
                <h2 className="text-3xl font-display font-bold text-primary mb-8 border-b border-border pb-4">
                  {category.category}
                </h2>

                {/* Common ingredients for Doggie Cakes */}
                {category.commonIngredients && (
                  <div className="mb-8 bg-secondary/50 rounded-2xl p-6">
                    <h4 className="font-bold text-accent mb-4">Common for all cakes:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold text-accent">Cake Frosting: </span>
                        <span className="text-accent/80">{category.commonIngredients.frosting.join(', ')}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-accent">Cake Filling: </span>
                        <span className="text-accent/80">{category.commonIngredients.filling.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {category.products.map((product, productIndex) => (
                    <div key={productIndex} className="bg-secondary/30 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-accent mb-4">{product.name}</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-accent mb-2">Ingredients:</h4>
                          <ul className="space-y-1">
                            {product.ingredients.map((ingredient, ingredientIndex) => (
                              <li key={ingredientIndex} className="text-accent/80 text-sm">
                                • {ingredient}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {product.frosting && (
                          <div>
                            <h4 className="font-semibold text-accent mb-2">Frosting:</h4>
                            <ul className="space-y-1">
                              {product.frosting.map((item, frostingIndex) => (
                                <li key={frostingIndex} className="text-accent/80 text-sm">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {product.optional && (
                          <div>
                            <h4 className="font-semibold text-accent mb-2">Optional:</h4>
                            <ul className="space-y-1">
                              {product.optional.map((item, optionalIndex) => (
                                <li key={optionalIndex} className="text-accent/80 text-sm">
                                  • {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center bg-primary/5 rounded-3xl p-8">
            <h3 className="text-2xl font-display font-bold text-accent mb-4">
              🐾 Our Promise
            </h3>
            <p className="text-lg text-accent/80 max-w-3xl mx-auto">
              Every ingredient is chosen for its nutritional value and safety for dogs. 
              We use human-grade ingredients wherever possible and never include anything harmful 
              like Xylitol, artificial preservatives, or excessive salt.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}