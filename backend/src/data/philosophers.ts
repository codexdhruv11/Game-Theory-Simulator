import { IPhilosopher } from '../models/Philosopher';

export const philosophersData: any[] = [
  {
    name: 'Aristotle',
    slug: 'aristotle',
    era: 'Ancient',
    school: 'Virtue Ethics',
    avatar: '/avatars/aristotle.jpg',
    biography: {
      brief: 'Ancient Greek philosopher and polymath, student of Plato and tutor to Alexander the Great.',
      detailed: 'Aristotle (384-322 BCE) was a Greek philosopher and polymath during the Classical period in Ancient Greece. Taught by Plato, he was the founder of the Lyceum and the Peripatetic school of philosophy. His writings cover many subjects including physics, biology, zoology, metaphysics, logic, ethics, aesthetics, poetry, theatre, music, rhetoric, psychology, linguistics, economics, politics, and government.',
      keyWorks: ['Nicomachean Ethics', 'Politics', 'Metaphysics', 'Poetics'],
      influences: ['Plato', 'Socrates'],
      influenced: ['Thomas Aquinas', 'Averroes', 'Maimonides'],
    },
    philosophy: {
      coreBeliefs: [
        'Virtue is the mean between extremes',
        'Happiness (eudaimonia) is the highest good',
        'Practical wisdom guides ethical action',
        'Humans are political animals',
      ],
      ethicalFramework: 'Virtue Ethics - focuses on character traits and moral excellence',
      gameTheoryRelevance: 'Emphasizes the importance of character in decision-making and the pursuit of the common good in strategic interactions.',
      keyQuotes: [
        {
          text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
          context: 'On the development of virtue through practice',
          source: 'Nicomachean Ethics',
        },
        {
          text: 'The whole is greater than the sum of its parts.',
          context: 'On cooperation and collective action',
          source: 'Metaphysics',
        },
      ],
    },
    gameGuidance: {
      prisonersDilemma: {
        cooperationAdvice: 'Choose cooperation as it demonstrates the virtue of justice and contributes to the common good.',
        defectionAdvice: 'Defection may seem rational but undermines the social fabric that enables human flourishing.',
        generalStrategy: 'Act according to virtue and consider what a person of excellent character would do.',
        reasoning: 'Virtue ethics emphasizes character over consequences. A virtuous person cooperates because it reflects justice and friendship.',
      },
      nashEquilibrium: {
        advice: 'Seek equilibria that promote the common good and allow all parties to flourish.',
        reasoning: 'The best equilibrium is one that enables eudaimonia (flourishing) for all participants.',
      },
      zeroSumGame: {
        advice: 'Even in competition, maintain virtue and honor. Victory without virtue is hollow.',
        reasoning: 'True excellence involves competing with honor and respecting opponents.',
      },
      auctionTheory: {
        biddingAdvice: 'Bid fairly and honestly, avoiding both excessive greed and false modesty.',
        reasoning: 'The virtue of justice requires fair dealing in all transactions.',
      },
      evolutionaryGame: {
        strategyAdvice: 'Develop strategies that promote long-term flourishing rather than short-term gains.',
        reasoning: 'Sustainable strategies align with virtue and contribute to the common good.',
      },
      repeatedGames: {
        longTermStrategy: 'Build relationships based on trust and mutual respect.',
        cooperationThreshold: 'Cooperate with those who demonstrate virtue and reciprocity.',
        reasoning: 'Friendship and trust are fundamental to human flourishing and social cooperation.',
      },
      networkGames: {
        coordinationAdvice: 'Work towards coordination that benefits the entire community.',
        reasoning: 'Humans are political animals who achieve their highest potential through cooperation.',
      },
      cooperativeGames: {
        coalitionAdvice: 'Form coalitions based on shared values and mutual benefit.',
        reasoning: 'Just coalitions promote the common good and enable all members to flourish.',
      },
    },
    moralAlignment: {
      utilitarian: 20,
      deontological: 30,
      virtue: 90,
      contractual: 40,
      care: 60,
    },
    popularity: {
      timesSelected: 0,
      averageRating: 0,
      totalRatings: 0,
    },
    isActive: true,
  },
  {
    name: 'Immanuel Kant',
    slug: 'immanuel-kant',
    era: 'Enlightenment',
    school: 'Deontological Ethics',
    avatar: '/avatars/kant.jpg',
    biography: {
      brief: 'German philosopher who argued that moral actions must be based on duty and universal principles.',
      detailed: 'Immanuel Kant (1724-1804) was a German philosopher and one of the central Enlightenment thinkers. His comprehensive and systematic works in epistemology, metaphysics, ethics, and aesthetics have made him one of the most influential figures in modern Western philosophy.',
      keyWorks: ['Critique of Pure Reason', 'Critique of Practical Reason', 'Groundwork for the Metaphysics of Morals'],
      influences: ['David Hume', 'Jean-Jacques Rousseau'],
      influenced: ['Georg Wilhelm Friedrich Hegel', 'Arthur Schopenhauer', 'John Rawls'],
    },
    philosophy: {
      coreBeliefs: [
        'Act only according to maxims you could will to be universal laws',
        'Treat humanity always as an end, never merely as means',
        'Moral worth comes from acting from duty, not inclination',
        'Reason is the source of moral law',
      ],
      ethicalFramework: 'Deontological Ethics - duty-based morality with universal principles',
      gameTheoryRelevance: 'Provides a framework for evaluating the universalizability of strategic choices and treating all players with dignity.',
      keyQuotes: [
        {
          text: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
          context: 'The Categorical Imperative',
          source: 'Groundwork for the Metaphysics of Morals',
        },
        {
          text: 'Act so that you treat humanity, whether in your own person or in that of another, always as an end and never merely as a means.',
          context: 'The Formula of Humanity',
          source: 'Groundwork for the Metaphysics of Morals',
        },
      ],
    },
    gameGuidance: {
      prisonersDilemma: {
        cooperationAdvice: 'Cooperate because you can will cooperation to be a universal law.',
        defectionAdvice: 'Defection fails the universalizability test - a world where everyone defects would be irrational.',
        generalStrategy: 'Apply the categorical imperative: act only on maxims you could will to be universal laws.',
        reasoning: 'Cooperation passes the universalizability test, while defection leads to contradiction when universalized.',
      },
      nashEquilibrium: {
        advice: 'Choose equilibria that respect the dignity of all players and could be universally adopted.',
        reasoning: 'The best equilibrium is one that treats all participants as ends in themselves.',
      },
      zeroSumGame: {
        advice: 'Compete fairly according to rules that could be universal laws.',
        reasoning: 'Even in competition, maintain respect for the dignity of opponents.',
      },
      auctionTheory: {
        biddingAdvice: 'Bid honestly according to principles you could will all bidders to follow.',
        reasoning: 'Deceptive bidding fails the universalizability test.',
      },
      evolutionaryGame: {
        strategyAdvice: 'Adopt strategies based on principles that could govern all players.',
        reasoning: 'Sustainable strategies must be universalizable and respect human dignity.',
      },
      repeatedGames: {
        longTermStrategy: 'Maintain consistent principles regardless of others\' actions.',
        cooperationThreshold: 'Cooperate based on duty, not on others\' behavior.',
        reasoning: 'Moral action stems from duty, not from consequences or reciprocity.',
      },
      networkGames: {
        coordinationAdvice: 'Coordinate according to principles that respect everyone\'s autonomy.',
        reasoning: 'Coordination must preserve the dignity and autonomy of all participants.',
      },
      cooperativeGames: {
        coalitionAdvice: 'Form coalitions based on principles that could be universal laws.',
        reasoning: 'Coalition formation must respect the dignity of all players, including those excluded.',
      },
    },
    moralAlignment: {
      utilitarian: 10,
      deontological: 95,
      virtue: 40,
      contractual: 70,
      care: 30,
    },
    popularity: {
      timesSelected: 0,
      averageRating: 0,
      totalRatings: 0,
    },
    isActive: true,
  },
  {
    name: 'John Stuart Mill',
    slug: 'john-stuart-mill',
    era: 'Modern',
    school: 'Utilitarianism',
    avatar: '/avatars/mill.jpg',
    biography: {
      brief: 'British philosopher and political economist, advocate of utilitarianism and individual liberty.',
      detailed: 'John Stuart Mill (1806-1873) was an English philosopher, political economist, and civil servant. One of the most influential thinkers in the history of classical liberalism, he contributed widely to social theory, political theory, and political economy.',
      keyWorks: ['On Liberty', 'Utilitarianism', 'The Subjection of Women', 'Principles of Political Economy'],
      influences: ['Jeremy Bentham', 'Adam Smith'],
      influenced: ['Henry Sidgwick', 'Peter Singer'],
    },
    philosophy: {
      coreBeliefs: [
        'Actions are right as they promote happiness, wrong as they produce the reverse',
        'The greatest happiness for the greatest number',
        'Individual liberty should be maximized within limits',
        'Higher pleasures are more valuable than lower ones',
      ],
      ethicalFramework: 'Utilitarianism - maximizing overall happiness and well-being',
      gameTheoryRelevance: 'Provides a framework for evaluating outcomes based on their contribution to overall welfare and happiness.',
      keyQuotes: [
        {
          text: 'The greatest happiness principle holds that actions are right in proportion as they tend to promote happiness.',
          context: 'Defining utilitarianism',
          source: 'Utilitarianism',
        },
        {
          text: 'The only way in which a human being can make some approach to knowing the whole of a subject is by hearing what can be said about it by persons of every variety of opinion.',
          context: 'On the importance of diverse perspectives',
          source: 'On Liberty',
        },
      ],
    },
    gameGuidance: {
      prisonersDilemma: {
        cooperationAdvice: 'Cooperate if it maximizes overall happiness for all players.',
        defectionAdvice: 'Defection may be justified if it produces greater overall utility.',
        generalStrategy: 'Calculate the total happiness produced by each choice and select accordingly.',
        reasoning: 'The right action is the one that produces the greatest happiness for the greatest number.',
      },
      nashEquilibrium: {
        advice: 'Seek equilibria that maximize total welfare across all players.',
        reasoning: 'The best equilibrium is the one that produces the greatest overall happiness.',
      },
      zeroSumGame: {
        advice: 'In zero-sum situations, consider the broader social implications of victory.',
        reasoning: 'Even in competition, consider how the outcome affects overall social welfare.',
      },
      auctionTheory: {
        biddingAdvice: 'Bid in ways that promote efficient allocation and overall welfare.',
        reasoning: 'Efficient markets tend to maximize overall utility and happiness.',
      },
      evolutionaryGame: {
        strategyAdvice: 'Evolve strategies that maximize collective welfare over time.',
        reasoning: 'Sustainable strategies should promote the greatest happiness for the greatest number.',
      },
      repeatedGames: {
        longTermStrategy: 'Build cooperation when it increases overall welfare.',
        cooperationThreshold: 'Cooperate when the long-term benefits to all exceed short-term costs.',
        reasoning: 'Repeated cooperation often maximizes total utility across all interactions.',
      },
      networkGames: {
        coordinationAdvice: 'Coordinate to maximize network-wide welfare and happiness.',
        reasoning: 'Successful coordination typically increases overall utility for all participants.',
      },
      cooperativeGames: {
        coalitionAdvice: 'Form coalitions that maximize total welfare, considering effects on non-members.',
        reasoning: 'The best coalitions are those that increase overall social welfare.',
      },
    },
    moralAlignment: {
      utilitarian: 95,
      deontological: 20,
      virtue: 30,
      contractual: 50,
      care: 40,
    },
    popularity: {
      timesSelected: 0,
      averageRating: 0,
      totalRatings: 0,
    },
    isActive: true,
  },
  {
    name: 'John Rawls',
    slug: 'john-rawls',
    era: 'Contemporary',
    school: 'Political Philosophy',
    avatar: '/avatars/rawls.jpg',
    biography: {
      brief: 'American political philosopher known for his theory of justice and the "veil of ignorance" thought experiment.',
      detailed: 'John Rawls (1921-2002) was an American moral and political philosopher in the liberal tradition. His theory of justice as fairness describes a society of free citizens holding equal basic rights and cooperating within an egalitarian economic system.',
      keyWorks: ['A Theory of Justice', 'Political Liberalism', 'The Law of Peoples'],
      influences: ['Immanuel Kant', 'John Stuart Mill'],
      influenced: ['Thomas Pogge', 'Samuel Freeman'],
    },
    philosophy: {
      coreBeliefs: [
        'Justice is fairness',
        'Design society from behind a "veil of ignorance"',
        'Equal basic liberties for all',
        'Social and economic inequalities must benefit the least advantaged',
      ],
      ethicalFramework: 'Justice as Fairness - contractual approach to social justice',
      gameTheoryRelevance: 'Provides principles for fair distribution and cooperation, especially relevant for coalition formation and mechanism design.',
      keyQuotes: [
        {
          text: 'Justice is the first virtue of social institutions.',
          context: 'Opening of A Theory of Justice',
          source: 'A Theory of Justice',
        },
        {
          text: 'The principles of justice are chosen behind a veil of ignorance.',
          context: 'The original position thought experiment',
          source: 'A Theory of Justice',
        },
      ],
    },
    gameGuidance: {
      prisonersDilemma: {
        cooperationAdvice: 'Cooperate as it reflects the principle of mutual benefit and fairness.',
        defectionAdvice: 'Defection violates the principle of treating others fairly.',
        generalStrategy: 'Choose as if you didn\'t know which player you would be.',
        reasoning: 'Behind the veil of ignorance, rational actors would choose mutual cooperation.',
      },
      nashEquilibrium: {
        advice: 'Prefer equilibria that are fair to all players, especially the worst-off.',
        reasoning: 'Just equilibria are those that rational people would choose from the original position.',
      },
      zeroSumGame: {
        advice: 'Ensure that competitive rules are fair and agreed upon by all participants.',
        reasoning: 'Fair competition requires just background institutions and equal opportunities.',
      },
      auctionTheory: {
        biddingAdvice: 'Support auction mechanisms that are fair and transparent to all bidders.',
        reasoning: 'Just auction mechanisms ensure fair procedures and equal treatment.',
      },
      evolutionaryGame: {
        strategyAdvice: 'Evolve strategies that maintain fairness and benefit the least advantaged.',
        reasoning: 'Sustainable evolution requires just institutions that all can accept.',
      },
      repeatedGames: {
        longTermStrategy: 'Build institutions that ensure fair treatment over time.',
        cooperationThreshold: 'Cooperate within just institutions that protect all participants.',
        reasoning: 'Stable cooperation requires fair background conditions and mutual respect.',
      },
      networkGames: {
        coordinationAdvice: 'Coordinate through fair procedures that respect everyone\'s equal status.',
        reasoning: 'Just coordination ensures that all participants are treated as free and equal.',
      },
      cooperativeGames: {
        coalitionAdvice: 'Form coalitions that respect principles of justice and fairness.',
        reasoning: 'Just coalitions operate under fair terms that all members can accept.',
      },
    },
    moralAlignment: {
      utilitarian: 40,
      deontological: 60,
      virtue: 50,
      contractual: 90,
      care: 70,
    },
    popularity: {
      timesSelected: 0,
      averageRating: 0,
      totalRatings: 0,
    },
    isActive: true,
  },
  {
    name: 'Carol Gilligan',
    slug: 'carol-gilligan',
    era: 'Contemporary',
    school: 'Ethics of Care',
    avatar: '/avatars/gilligan.jpg',
    biography: {
      brief: 'American feminist, ethicist, and psychologist known for her work on ethics of care and moral development.',
      detailed: 'Carol Gilligan (born 1936) is an American feminist, ethicist, and psychologist, best known for her work on ethical community and ethical relationships. She is currently a professor at New York University and was a professor at Harvard University for many years.',
      keyWorks: ['In a Different Voice', 'The Birth of Pleasure', 'Joining the Resistance'],
      influences: ['Lawrence Kohlberg', 'Nel Noddings'],
      influenced: ['Virginia Held', 'Joan Tronto'],
    },
    philosophy: {
      coreBeliefs: [
        'Ethics should focus on care and relationships',
        'Moral development includes care-based reasoning',
        'Context and relationships matter in moral decisions',
        'Responsibility and care are central to ethics',
      ],
      ethicalFramework: 'Ethics of Care - emphasizing relationships, care, and responsibility',
      gameTheoryRelevance: 'Highlights the importance of relationships and care in strategic interactions, especially in repeated and cooperative games.',
      keyQuotes: [
        {
          text: 'The moral imperative that emerges repeatedly in interviews with women is an injunction to care.',
          context: 'On women\'s moral reasoning',
          source: 'In a Different Voice',
        },
        {
          text: 'Care as a practice involves more than good intentions.',
          context: 'On the nature of care',
          source: 'In a Different Voice',
        },
      ],
    },
    gameGuidance: {
      prisonersDilemma: {
        cooperationAdvice: 'Cooperate to maintain and strengthen relationships with others.',
        defectionAdvice: 'Defection damages relationships and violates our responsibility to care for others.',
        generalStrategy: 'Consider how your choices affect relationships and the well-being of others.',
        reasoning: 'Care ethics prioritizes maintaining relationships and responding to others\' needs.',
      },
      nashEquilibrium: {
        advice: 'Seek equilibria that preserve and enhance caring relationships.',
        reasoning: 'The best outcomes are those that maintain the web of relationships and mutual care.',
      },
      zeroSumGame: {
        advice: 'Even in competition, maintain care and concern for opponents\' well-being.',
        reasoning: 'Competition should not destroy the fundamental relationships that connect us.',
      },
      auctionTheory: {
        biddingAdvice: 'Consider the impact of bidding on relationships and community well-being.',
        reasoning: 'Economic transactions occur within webs of relationships that must be preserved.',
      },
      evolutionaryGame: {
        strategyAdvice: 'Evolve strategies that strengthen caring relationships and community bonds.',
        reasoning: 'Sustainable strategies must nurture the relationships that sustain communities.',
      },
      repeatedGames: {
        longTermStrategy: 'Build and maintain caring relationships through consistent attention to others\' needs.',
        cooperationThreshold: 'Cooperate to nurture relationships, even when others don\'t reciprocate immediately.',
        reasoning: 'Care ethics emphasizes ongoing responsibility for relationships, not just reciprocity.',
      },
      networkGames: {
        coordinationAdvice: 'Coordinate in ways that strengthen the caring connections between all participants.',
        reasoning: 'Successful coordination should enhance rather than diminish caring relationships.',
      },
      cooperativeGames: {
        coalitionAdvice: 'Form coalitions based on care and mutual support, not just strategic advantage.',
        reasoning: 'The best coalitions are those built on genuine care and concern for all members.',
      },
    },
    moralAlignment: {
      utilitarian: 30,
      deontological: 20,
      virtue: 60,
      contractual: 40,
      care: 95,
    },
    popularity: {
      timesSelected: 0,
      averageRating: 0,
      totalRatings: 0,
    },
    isActive: true,
  },
];