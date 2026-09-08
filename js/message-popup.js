// Real student testimonial quotes for the rotating social-proof toast
// (see initSocialProofToast() in main.js). Content supplied directly by
// Ranbbir Sir's team — keep wording and attribution exactly as given.
const TESTIMONIAL_MESSAGES = [
  // On teaching style & discipline
  { name: "Ananya", msg: "Guru Ranbir doesn't just teach steps, he teaches discipline." },
  { name: "Meera", msg: "Every class with Sir feels like a step closer to who I want to become." },
  { name: "Divya", msg: "He corrected my angasudhi for months until it became second nature." },
  { name: "Kavya", msg: "Patient, precise, and never lets you settle for 'good enough.'" },
  { name: "Priya", msg: "The rigor is real, but so is the care behind it." },
  { name: "Sanjana", msg: "He sees what you can't see in yourself yet." },
  { name: "Ishita", msg: "Every mistake became a lesson, never a scolding." },
  { name: "Nithya", msg: "Sir's feedback is honest — and that's exactly why it works." },

  // On abhinaya & expression
  { name: "Lakshmi", msg: "He taught me that abhinaya begins in the eyes, not the hands." },
  { name: "Anjali", msg: "I finally understood what it means to feel a story, not just perform it." },
  { name: "Ritika", msg: "My expressions changed the day he said, 'dance the emotion, not the movement.'" },
  { name: "Shreya", msg: "Under his guidance, abhinaya stopped being a technique and became instinct." },
  { name: "Pooja", msg: "He unlocked something in my performance I didn't know was there." },

  // On rhythm & technique
  { name: "Vidya", msg: "My talem finally clicked after years of struggling with it." },
  { name: "Nandini", msg: "He breaks down the most complex adavus until they feel simple." },
  { name: "Aishwarya", msg: "My footwork is sharper, my rhythm steadier — all thanks to Sir." },
  { name: "Rukmini", msg: "He has an ear for rhythm that catches what no one else notices." },
  { name: "Swathi", msg: "Every jathi felt impossible until he showed me how to count it." },

  // On growth & confidence
  { name: "Tanvi", msg: "I walked in shy. I walked out ready for the stage." },
  { name: "Keerthana", msg: "Nrityam gave me more than dance — it gave me confidence." },
  { name: "Deepika", msg: "He believed in my arangetram before I believed in myself." },
  { name: "Radhika", msg: "Three years in, and I'm a completely different dancer." },
  { name: "Vaishnavi", msg: "He pushed me exactly when I needed pushing." },
  { name: "Harini", msg: "I found my stage presence here, under his eye." },
  { name: "Chitra", msg: "Sir taught me that grace and strength aren't opposites." },

  // On the classroom experience
  { name: "Malavika", msg: "Every class feels like a piece of tradition, alive in the room." },
  { name: "Nivedita", msg: "He makes 500-year-old choreography feel like it was written for today." },
  { name: "Aparna", msg: "There's a warmth in his classroom that keeps you coming back." },
  { name: "Sowmya", msg: "He remembers every student's strengths — and pushes each of us differently." },
  { name: "Gayatri", msg: "Learning from him feels like learning from a living lineage." },

  // On performances & milestones
  { name: "Anusha", msg: "My arangetram was the proudest night of my life — he made it possible." },
  { name: "Meghana", msg: "He rehearsed with us until midnight before our first big show." },
  { name: "Sneha", msg: "Every performance, he's in the wings, more nervous than we are." },
  { name: "Varsha", msg: "He celebrates every small win like it's a big one." },
  { name: "Lavanya", msg: "Standing on stage under his training — nothing compares." },

  // Short & punchy (toast-style)
  { name: "Ramya", msg: "Best decision I made for my dance journey." },
  { name: "Sindhu", msg: "He doesn't teach dance. He teaches devotion." },
  { name: "Bhavya", msg: "A true guru, in every sense of the word." },
  { name: "Yamini", msg: "Nrityam changed how I see Bharatanatyam." },
  { name: "Charitha", msg: "Every class, I leave a little more inspired." },
  { name: "Ashwini", msg: "He makes discipline feel like devotion." },
  { name: "Preethi", msg: "The patience of a guru, the eye of a perfectionist." },
  { name: "Parent of Ira", msg: "My daughter's growth here has been remarkable." },
  { name: "Sana", msg: "Worth every mile I travel for class." },
  { name: "Renuka", msg: "He turned my hobby into my passion." },

  // On legacy & tradition
  { name: "Shalini", msg: "He carries the tradition forward with so much respect." },
  { name: "Vandana", msg: "Learning from him feels like touching something timeless." },
  { name: "Padmini", msg: "He honors the classical form while making it accessible to us." },
  { name: "Kalyani", msg: "Sir doesn't just train dancers, he shapes artists." },
  { name: "Manasa", msg: "I'm proud to call Nrityam my dance home." },
];
