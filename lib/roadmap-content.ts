import type { Difficulty, Domain } from "@prisma/client"

type RoadmapLike = {
  title: string
  domain: Domain
  description: string | null
  targetRole: string | null
}

type RoadmapItemLike = {
  id: string
  title: string
  status: string
  estimatedMinutes: number
  scheduledDate: Date | null
  difficulty: Difficulty | null
}

export type RoadmapNarrative = {
  summary: string
  outcomes: string[]
}

export type RoadmapUnit = {
  title: string
  description: string
  items: RoadmapItemLike[]
}

export function getRoadmapNarrative(roadmap: RoadmapLike): RoadmapNarrative {
  if (roadmap.title.includes("Karpathy")) {
    return {
      summary:
        "Build a ground-up understanding of neural networks: backpropagation, embeddings, MLPs, normalization, sequence models, attention, and a small GPT-style model.",
      outcomes: [
        "Explain what gradients and backpropagation compute without hand-waving.",
        "Recreate core notebooks from scratch instead of only watching lectures.",
        "Connect low-level neural net mechanics to modern recommender and language models.",
      ],
    }
  }

  if (roadmap.title.includes("Advanced Python LeetCode")) {
    return {
      summary:
        "Rebuild interview speed in Python with a shuffled medium-hard set across DP, graphs, design, heaps, stacks, windows, and backtracking.",
      outcomes: [
        "Translate known Java problem-solving patterns into idiomatic Python.",
        "Practice recognizing patterns without relying on topic order.",
        "Build speed on harder interview-style problems.",
      ],
    }
  }

  if (roadmap.title.includes("3Blue1Brown")) {
    return {
      summary:
        "Develop visual intuition for vectors, matrices, transformations, determinants, bases, eigenvectors, and the geometry behind linear algebra.",
      outcomes: [
        "See matrix multiplication as composition of transformations.",
        "Understand determinants, inverse matrices, null space, and column space visually.",
        "Use geometric intuition as a foundation for ML and recommender systems.",
      ],
    }
  }

  if (roadmap.title.includes("Stat 110")) {
    return {
      summary:
        "Build probability fluency from counting and conditional probability through random variables, expectation, distributions, and limit theorems.",
      outcomes: [
        "Reason clearly about uncertainty and conditional events.",
        "Use random variables and expectation comfortably in ML contexts.",
        "Prepare for statistics-heavy recommender systems and evaluation work.",
      ],
    }
  }

  if (roadmap.title.includes("RecSys MOOC")) {
    return {
      summary:
        "Get a structured recommender systems foundation: user-item modeling, evaluation, collaborative filtering, content signals, and practical system tradeoffs.",
      outcomes: [
        "Understand common recommender families and when they are used.",
        "Connect course concepts to papers and production systems.",
        "Build vocabulary for Netflix-style recommendation work.",
      ],
    }
  }

  if (roadmap.title.includes("RecSys Foundations")) {
    return {
      summary:
        "Read the core industrial recommender systems arc from matrix factorization to two-tower retrieval, ranking, multitask learning, sequence models, and frontier generative retrieval.",
      outcomes: [
        "Explain how classical CF evolved into modern deep retrieval and ranking.",
        "Compare candidate generation, ranking, evaluation, and counterfactual learning papers.",
        "Produce publishable paper notes and interview-ready summaries.",
      ],
    }
  }

  if (roadmap.title.includes("Netflix Tech Blog")) {
    return {
      summary:
        "Track how Netflix discusses recommendations, experimentation, engineering tradeoffs, and production ML systems in public technical writing.",
      outcomes: [
        "Translate blog posts into practical system-design talking points.",
        "Identify production concerns that papers often omit.",
        "Build a sharper mental model of recommendation work at scale.",
      ],
    }
  }

  if (roadmap.title.includes("learncpp")) {
    return {
      summary:
        "Refresh C++ fundamentals for systems work: language basics, memory model, types, functions, ownership-adjacent concepts, and practical syntax.",
      outcomes: [
        "Read and write C++ with less friction.",
        "Understand lower-level implementation details behind systems and ML infrastructure.",
        "Prepare for deeper systems and performance topics later.",
      ],
    }
  }

  if (roadmap.title.includes("VMLS")) {
    return {
      summary:
        "Learn applied linear algebra through vectors, clustering, linear equations, dynamical systems, and modeling tools used in ML.",
      outcomes: [
        "Connect algebraic operations to applied modeling tasks.",
        "Strengthen the math foundation for optimization and recommender systems.",
        "Use linear algebra language more precisely in notes and interviews.",
      ],
    }
  }

  if (roadmap.domain === "REVIEW") {
    return {
      summary:
        "Maintain retention and direction through weekly retrospectives, spaced review, synthesis notes, and planning checkpoints.",
      outcomes: [
        "Keep hard concepts active instead of passively moving on.",
        "Identify weak spots early.",
        "Turn scattered work into coherent learning artifacts.",
      ],
    }
  }

  return {
    summary:
      roadmap.description ||
      "Work through this roadmap as a focused sequence of study sessions, notes, and review checkpoints.",
    outcomes: [
      "Complete the planned items in order.",
      "Capture durable notes from each session.",
      "Use reviews to turn progress into retention.",
    ],
  }
}

export function buildRoadmapUnits(
  roadmap: RoadmapLike,
  items: RoadmapItemLike[]
): RoadmapUnit[] {
  const definitions = getUnitDefinitions(roadmap)
  const units = definitions.map((definition) => ({
    title: definition.title,
    description: definition.description,
    items: items.filter((item) => definition.matches(item.title)),
  }))

  const matched = new Set(units.flatMap((unit) => unit.items))
  const remaining = items.filter((item) => !matched.has(item))
  if (remaining.length > 0) {
    units.push({
      title: "Additional work",
      description: "Items that do not fit the main unit labels yet.",
      items: remaining,
    })
  }

  return units.filter((unit) => unit.items.length > 0)
}

function getUnitDefinitions(roadmap: RoadmapLike) {
  if (roadmap.title.includes("Karpathy")) {
    return [
      unit("Micrograd and backprop", "Build intuition for scalar autograd and what gradients mean.", ["ep 1", "micrograd", "backprop"]),
      unit("Makemore foundations", "Move from counts to neural character-level models.", ["ep 2", "bigram"]),
      unit("MLPs and optimization", "Train small neural nets and reason about hyperparameters.", ["ep 3", "MLP"]),
      unit("Normalization and training stability", "Understand BatchNorm and training dynamics.", ["ep 4", "BatchNorm"]),
      unit("Manual gradients", "Recreate backprop by hand to remove mystery.", ["ep 5", "manual backprop"]),
      unit("Sequence models and GPT", "Build toward WaveNet and GPT-style sequence modeling.", ["ep 6", "WaveNet", "ep 7", "GPT"]),
    ]
  }

  if (roadmap.title.includes("Advanced Python LeetCode")) {
    return [
      unit("Python fluency warmup", "Medium problems that reward concise Python data structures.", ["Subarray", "Accounts", "Increasing", "Task Scheduler", "Kth Smallest", "Random Pick", "GetRandom"]),
      unit("Graphs", "BFS, DFS, union find, topological sort, shortest path, and graph modeling.", ["Ladder", "Island", "Course", "Itinerary", "Flights", "Bus", "Swim", "Division", "Path in"]),
      unit("Dynamic programming", "State design, transitions, interval-like choices, and memoization.", ["Decode", "Jump", "Coin", "Square", "Edit Distance", "Profit", "Ways", "Regular Expression", "Stock", "Job Scheduling"]),
      unit("Design", "Data structures and API-style implementation practice.", ["Design", "Cache", "Data Stream", "File System", "Autocomplete"]),
      unit("Stack, heap, and binary search", "Monotonic structures, priority queues, and search over answers.", ["Rectangle", "Calculator", "Greater Element", "Median", "Kth Largest", "Sticks", "Refueling", "Split Array"]),
      unit("Backtracking and hard search", "Recursive search with pruning and careful state handling.", ["Word Search", "N-Queens", "Expression", "Word Break", "Parentheses"]),
    ]
  }

  if (roadmap.title.includes("3Blue1Brown")) {
    return [
      unit("Vectors and span", "Understand vectors, span, basis, and geometric representation.", ["ep 1", "ep 2"]),
      unit("Linear transformations", "See matrices as transformations and composition.", ["ep 3", "ep 4", "ep 5"]),
      unit("Determinants and inverse", "Understand area scaling, inverse matrices, column space, and null space.", ["ep 6", "ep 7", "ep 8"]),
      unit("Products and coordinates", "Build intuition for dot products, cross products, and basis changes.", ["ep 9", "ep 10", "ep 11", "ep 12"]),
      unit("Eigenvectors and abstraction", "Connect eigenvectors and abstract vector spaces to ML foundations.", ["ep 13", "ep 14", "ep 15", "ep 16"]),
    ]
  }

  if (roadmap.title.includes("Stat 110")) {
    return [
      unit("Counting and conditioning", "Start with counting, stories, conditional probability, and Bayes thinking.", ["lecture 1", "lecture 2", "lecture 3", "lecture 4", "lecture 5", "lecture 6", "lecture 7"]),
      unit("Random variables", "Move into random variables, distributions, and expectation.", ["lecture 8", "lecture 9", "lecture 10", "lecture 11", "lecture 12", "lecture 13", "lecture 14"]),
      unit("Joint distributions and transforms", "Build fluency with dependence, covariance, conditioning, and generating functions.", ["lecture 15", "lecture 16", "lecture 17", "lecture 18", "lecture 19", "lecture 20", "lecture 21"]),
      unit("Limit theorems and inference", "Connect probability tools to asymptotics and statistical reasoning.", ["lecture 22", "lecture 23", "lecture 24", "lecture 25", "lecture 26", "lecture 27", "lecture 28", "lecture 29", "lecture 30", "lecture 31", "lecture 32", "lecture 33", "lecture 34"]),
    ]
  }

  if (roadmap.title.includes("RecSys Foundations")) {
    return [
      unit("Classical recommendation", "Matrix factorization, Bayesian personalized ranking, and collaborative filtering foundations.", ["Paper #1", "Paper #2"]),
      unit("Deep ranking and retrieval", "Wide & Deep, YouTube retrieval/ranking, DeepFM, and two-tower retrieval.", ["Paper #3", "Paper #4", "Paper #5", "Paper #6", "Paper #7"]),
      unit("Multitask and sequence models", "MMoE, PLE, SASRec, BERT4Rec, DLRM, and industrial sequence modeling.", ["Paper #8", "Paper #9", "Paper #10", "Paper #11", "Paper #12", "Paper #13"]),
      unit("Industrial graph and calibration", "PinSAGE, calibration, Netflix case studies, counterfactual ranking, and treatments.", ["Paper #14", "Paper #15", "Paper #16", "Paper #17", "Paper #18"]),
      unit("Frontier retrieval", "Differentiable search, semantic IDs, HSTU, and modern generative retrieval directions.", ["Paper #19", "Paper #20", "Paper #21"]),
    ]
  }

  if (roadmap.title.includes("RecSys MOOC")) {
    return [
      unit("Course 1", "Introductory recommender systems concepts and vocabulary.", ["Course 1"]),
      unit("Course 2", "Collaborative filtering and user-item modeling.", ["Course 2"]),
      unit("Course 3", "Evaluation, metrics, and practical recommendation tradeoffs.", ["Course 3"]),
      unit("Course 4", "Advanced models and applied recommender system design.", ["Course 4"]),
    ]
  }

  if (roadmap.title.includes("learncpp")) {
    return [
      unit("C++ basics", "Setup, syntax, variables, expressions, and basic program structure.", ["ch 0", "ch 1", "ch 2", "ch 3"]),
      unit("Control and functions", "Control flow, functions, and common language mechanics.", ["ch 4", "ch 5", "ch 6", "ch 7"]),
      unit("Types and organization", "Types, files, modules, and larger program organization.", ["ch 8", "ch 9", "ch 10", "ch 11"]),
      unit("Systems foundations", "More advanced C++ concepts used for systems fluency.", ["ch 12", "ch 13", "ch 14"]),
    ]
  }

  if (roadmap.title.includes("VMLS")) {
    return [
      unit("Modeling with vectors", "Applied vector notation, clustering, and geometric thinking.", ["ch 4", "ch 5"]),
      unit("Linear systems", "Linear equations and transformations as modeling tools.", ["ch 7", "ch 8"]),
      unit("Dynamics and applications", "Linear dynamical systems and applied extensions.", ["ch 9", "ch 10"]),
    ]
  }

  if (roadmap.title.includes("Netflix Tech Blog")) {
    return [
      unit("Production reading", "Recent Netflix recommendation posts and engineering patterns.", ["Netflix Tech Blog"]),
    ]
  }

  return [
    unit("Planned work", "Scheduled sessions and review tasks for this roadmap.", [""]),
  ]
}

function unit(title: string, description: string, keywords: string[]) {
  return {
    title,
    description,
    matches(itemTitle: string) {
      return keywords.some((keyword) => itemTitle.includes(keyword))
    },
  }
}
