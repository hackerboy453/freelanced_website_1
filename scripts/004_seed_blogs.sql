-- Seed sample blog posts
INSERT INTO public.blogs (title, slug, content, excerpt, image_url, author_name, is_published) VALUES
  (
    'Top 10 Tech Gadgets to Watch in 2024',
    'top-10-tech-gadgets-2024',
    'Technology continues to evolve at a rapid pace, bringing us innovative gadgets that make our lives easier and more connected. In this article, we explore the top 10 tech gadgets that are set to dominate the market in 2024.

From advanced smartwatches with health monitoring features to AI-powered home assistants, these devices represent the cutting edge of consumer technology. Whether you''re a tech enthusiast or looking to upgrade your daily essentials, these gadgets are worth keeping an eye on.

The smartphone market continues to push boundaries with foldable displays and improved camera systems. Meanwhile, wearable technology is becoming more sophisticated with features like ECG monitoring and blood oxygen tracking.

Smart home devices are getting smarter, with integration becoming seamless across different ecosystems. From smart thermostats to security cameras, the connected home is becoming a reality for many households.',
    'Discover the most innovative tech gadgets that are set to transform how we live and work in 2024.',
    '/placeholder.svg?height=400&width=800',
    'Admin',
    true
  ),
  (
    'Fashion Trends: What''s Hot This Season',
    'fashion-trends-this-season',
    'Fashion is ever-evolving, and this season brings exciting new trends that blend comfort with style. From oversized silhouettes to bold colors, there''s something for everyone in the latest fashion lineup.

Sustainable fashion continues to gain momentum, with more brands focusing on eco-friendly materials and ethical production processes. Consumers are increasingly conscious about their fashion choices, opting for quality over quantity.

Athleisure remains a dominant trend, with comfortable yet stylish pieces that can transition from workout to casual outings. The line between sportswear and everyday fashion continues to blur.

Accessories are making bold statements this season, with chunky jewelry, statement bags, and unique footwear taking center stage. It''s all about expressing your personality through your style choices.',
    'Stay ahead of the curve with the latest fashion trends that are dominating runways and streets this season.',
    '/placeholder.svg?height=400&width=800',
    'Admin',
    true
  ),
  (
    'Home Organization Tips for a Clutter-Free Space',
    'home-organization-tips',
    'A well-organized home not only looks better but also contributes to mental well-being and productivity. Here are some practical tips to help you achieve a clutter-free living space.

Start with a decluttering session. Go through each room and categorize items into keep, donate, and discard piles. Be ruthless – if you haven''t used something in the past year, it''s probably time to let it go.

Invest in smart storage solutions. From closet organizers to drawer dividers, there are countless products designed to maximize your space. Consider vertical storage options to make the most of wall space.

Create designated zones for different activities. Having specific areas for work, relaxation, and hobbies helps maintain organization and makes it easier to find things when you need them.

Develop daily habits to maintain your organized space. Spend 10-15 minutes each day tidying up, and you''ll find that keeping your home organized becomes second nature.',
    'Transform your living space with these practical organization tips that will help you maintain a clutter-free home.',
    '/placeholder.svg?height=400&width=800',
    'Admin',
    true
  )
ON CONFLICT (slug) DO NOTHING;
