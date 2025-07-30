const mockArticles = [
  {
    id: '1',
    title: 'Breaking: Major Tech Innovation Announced',
    snippet: 'A revolutionary new technology has been unveiled that promises to transform the industry landscape.',
    imageUrl: 'https://picsum.photos/400/600?random=1',
    author: 'Tech Reporter',
    publishedAt: '2 hours ago',
    category: 'Technology',
    readTime: '3 min read'
  },
  {
    id: '2',
    title: 'Global Markets React to Economic Policy Changes',
    snippet: 'Financial markets worldwide are responding to recent policy announcements with significant volatility.',
    imageUrl: 'https://picsum.photos/400/600?random=2',
    author: 'Finance Editor',
    publishedAt: '4 hours ago',
    category: 'Business',
    readTime: '5 min read'
  },
  {
    id: '3',
    title: 'Climate Summit Yields Historic Agreement',
    snippet: 'World leaders have reached a landmark agreement on climate action at the annual summit.',
    imageUrl: 'https://picsum.photos/400/600?random=3',
    author: 'Environment Correspondent',
    publishedAt: '6 hours ago',
    category: 'Environment',
    readTime: '4 min read'
  },
  {
    id: '4',
    title: 'Space Exploration: New Mission to Mars Announced',
    snippet: 'NASA reveals plans for an ambitious new mission to explore the red planet.',
    imageUrl: 'https://picsum.photos/400/600?random=4',
    author: 'Science Writer',
    publishedAt: '8 hours ago',
    category: 'Science',
    readTime: '6 min read'
  },
  {
    id: '5',
    title: 'Healthcare Breakthrough: New Treatment Shows Promise',
    snippet: 'Clinical trials reveal promising results for a new treatment approach.',
    imageUrl: 'https://picsum.photos/400/600?random=5',
    author: 'Health Reporter',
    publishedAt: '10 hours ago',
    category: 'Health',
    readTime: '4 min read'
  },
  {
    id: '6',
    title: 'AI Revolutionizes Daily Life',
    snippet: 'Artificial intelligence is now part of everyday routines, from smart homes to self-driving cars.',
    imageUrl: 'https://picsum.photos/400/600?random=6',
    author: 'AI Correspondent',
    publishedAt: '12 hours ago',
    category: 'Technology',
    readTime: '7 min read'
  },
  {
    id: '7',
    title: 'Sports Update: Championship Results',
    snippet: 'The latest championship concluded with a thrilling finish and a new record.',
    imageUrl: 'https://picsum.photos/400/600?random=7',
    author: 'Sports Desk',
    publishedAt: '14 hours ago',
    category: 'Sports',
    readTime: '3 min read'
  },
  {
    id: '8',
    title: 'Travel Trends: Top Destinations 2025',
    snippet: 'Travel experts reveal the most popular destinations for the upcoming year.',
    imageUrl: 'https://picsum.photos/400/600?random=8',
    author: 'Travel Editor',
    publishedAt: '16 hours ago',
    category: 'Travel',
    readTime: '5 min read'
  },
  {
    id: '9',
    title: 'Education: New Learning Methods',
    snippet: 'Schools are adopting innovative teaching techniques to enhance student engagement.',
    imageUrl: 'https://picsum.photos/400/600?random=9',
    author: 'Education Reporter',
    publishedAt: '18 hours ago',
    category: 'Education',
    readTime: '4 min read'
  },
  {
    id: '10',
    title: 'Economy: Market Insights',
    snippet: 'Analysts discuss the current trends and future outlook for the global economy.',
    imageUrl: 'https://picsum.photos/400/600?random=10',
    author: 'Economics Analyst',
    publishedAt: '20 hours ago',
    category: 'Business',
    readTime: '6 min read'
  },
  {
    id: '11',
    title: 'Environment: Conservation Efforts',
    snippet: 'Communities worldwide are stepping up efforts to protect endangered species.',
    imageUrl: 'https://picsum.photos/400/600?random=11',
    author: 'Environment Desk',
    publishedAt: '22 hours ago',
    category: 'Environment',
    readTime: '4 min read'
  },
  {
    id: '12',
    title: 'Fashion: New Season Trends',
    snippet: 'Designers unveil their latest collections for the upcoming season.',
    imageUrl: 'https://picsum.photos/400/600?random=12',
    author: 'Fashion Editor',
    publishedAt: '1 day ago',
    category: 'Fashion',
    readTime: '3 min read'
  },
  {
    id: '13',
    title: 'Food: Culinary Innovations',
    snippet: 'Chefs are experimenting with new flavors and techniques in the kitchen.',
    imageUrl: 'https://picsum.photos/400/600?random=13',
    author: 'Food Critic',
    publishedAt: '1 day ago',
    category: 'Food',
    readTime: '4 min read'
  },
  {
    id: '14',
    title: 'Politics: Election Updates',
    snippet: 'Candidates are making their final pitches as election day approaches.',
    imageUrl: 'https://picsum.photos/400/600?random=14',
    author: 'Political Analyst',
    publishedAt: '1 day ago',
    category: 'Politics',
    readTime: '5 min read'
  },
  {
    id: '15',
    title: 'Science: Space Discoveries',
    snippet: 'Astronomers have discovered a new exoplanet in a distant solar system.',
    imageUrl: 'https://picsum.photos/400/600?random=15',
    author: 'Science Desk',
    publishedAt: '1 day ago',
    category: 'Science',
    readTime: '6 min read'
  },
  {
    id: '16',
    title: 'Tech: Gadget Reviews',
    snippet: 'The latest gadgets are put to the test in our comprehensive reviews.',
    imageUrl: 'https://picsum.photos/400/600?random=16',
    author: 'Tech Reviewer',
    publishedAt: '2 days ago',
    category: 'Technology',
    readTime: '4 min read'
  },
  {
    id: '17',
    title: 'Health: Wellness Tips',
    snippet: 'Experts share advice on maintaining physical and mental well-being.',
    imageUrl: 'https://picsum.photos/400/600?random=17',
    author: 'Health Columnist',
    publishedAt: '2 days ago',
    category: 'Health',
    readTime: '5 min read'
  },
  {
    id: '18',
    title: 'Business: Startup Success',
    snippet: 'Entrepreneurs reveal the secrets behind their successful startups.',
    imageUrl: 'https://picsum.photos/400/600?random=18',
    author: 'Business Reporter',
    publishedAt: '2 days ago',
    category: 'Business',
    readTime: '7 min read'
  },
  {
    id: '19',
    title: 'World: Global Events',
    snippet: 'Major events from around the world summarized for you.',
    imageUrl: 'https://picsum.photos/400/600?random=19',
    author: 'World News',
    publishedAt: '2 days ago',
    category: 'World',
    readTime: '4 min read'
  },
  {
    id: '20',
    title: 'Opinion: Editorial',
    snippet: 'Our editors weigh in on the most pressing issues of the day.',
    imageUrl: 'https://picsum.photos/400/600?random=20',
    author: 'Editorial Board',
    publishedAt: '2 days ago',
    category: 'Opinion',
    readTime: '3 min read'
  },
  {
    id: '21',
    title: 'Entertainment: Movie Reviews',
    snippet: 'The latest blockbuster films are reviewed by our critics.',
    imageUrl: 'https://picsum.photos/400/600?random=21',
    author: 'Film Critic',
    publishedAt: '3 days ago',
    category: 'Entertainment',
    readTime: '4 min read'
  },
  {
    id: '22',
    title: 'Lifestyle: Wellness Trends',
    snippet: 'Discover the latest trends in health and wellness.',
    imageUrl: 'https://picsum.photos/400/600?random=22',
    author: 'Lifestyle Editor',
    publishedAt: '3 days ago',
    category: 'Lifestyle',
    readTime: '5 min read'
  },
  {
    id: '23',
    title: 'Automotive: Electric Vehicle Revolution',
    snippet: 'The future of transportation is electric, and here\'s why.',
    imageUrl: 'https://picsum.photos/400/600?random=23',
    author: 'Auto Journalist',
    publishedAt: '3 days ago',
    category: 'Automotive',
    readTime: '6 min read'
  },
  {
    id: '24',
    title: 'Real Estate: Market Analysis',
    snippet: 'Understanding the current real estate market trends.',
    imageUrl: 'https://picsum.photos/400/600?random=24',
    author: 'Real Estate Analyst',
    publishedAt: '4 days ago',
    category: 'Real Estate',
    readTime: '5 min read'
  },
  {
    id: '25',
    title: 'Gaming: Industry Updates',
    snippet: 'The latest news from the world of gaming and esports.',
    imageUrl: 'https://picsum.photos/400/600?random=25',
    author: 'Gaming Reporter',
    publishedAt: '4 days ago',
    category: 'Gaming',
    readTime: '4 min read'
  }
];

export default mockArticles; 