#!/usr/bin/env python3
"""
Bulk SEO Article Generator for Baby Sleep Optimizer
Uses Wavespeed AI API to generate articles automatically
"""

import os
import requests
import json
import time
from datetime import datetime

# Configuration
WAVESPEED_API_KEY = "e9b19fe83377e82577d9017e94d72cd8f14dc672f542c27d709d05426055b1b1"
WAVESPEED_API_URL = "https://llm.wavespeed.ai/v1/chat/completions"  # CORRECT endpoint
OUTPUT_FOLDER = "generated_articles"

# High-value keywords to target
KEYWORDS = [
    {"keyword": "4 month sleep regression", "monthly_searches": 60500},
    {"keyword": "baby wake windows by age", "monthly_searches": 22200},
    {"keyword": "how to get baby to sleep through the night", "monthly_searches": 18100},
    {"keyword": "6 month old sleep schedule", "monthly_searches": 14800},
    {"keyword": "newborn sleep schedule", "monthly_searches": 12100},
    {"keyword": "9 month sleep regression", "monthly_searches": 9900},
    {"keyword": "baby sleep training methods", "monthly_searches": 8100},
    {"keyword": "3 month old wake windows", "monthly_searches": 7300},
    {"keyword": "baby nap schedule by age", "monthly_searches": 6600},
    {"keyword": "8 month sleep regression", "monthly_searches": 5900},
    {"keyword": "drowsy but awake", "monthly_searches": 5400},
    {"keyword": "baby bedtime routine", "monthly_searches": 4900},
    {"keyword": "5 month old sleep schedule", "monthly_searches": 4400},
    {"keyword": "baby sleep through night age", "monthly_searches": 3900},
    {"keyword": "newborn won't sleep", "monthly_searches": 3600},
]

# CTA templates
CTA_INLINE = """
<div style="background: linear-gradient(135deg, #6B9BD1 0%, #4A7BA7 100%); border-radius: 12px; padding: 30px; margin: 40px 0; text-align: center; box-shadow: 0 4px 15px rgba(107, 155, 209, 0.3);">
    <h3 style="color: white; margin: 0 0 15px 0; font-size: 24px; font-weight: 700;">Every Baby is Different</h3>
    <p style="color: #F4E4D7; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">Generic advice doesn't work. Get a sleep schedule personalized for YOUR baby's age, habits, and temperament.</p>
    <a href="../quiz.html" style="display: inline-block; background: white; color: #6B9BD1; padding: 15px 40px; border-radius: 30px; text-decoration: none; font-weight: 700; font-size: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">Get My Baby's Plan - $2.99</a>
    <p style="color: white; margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">✓ 60 seconds • AI-customized • Instant download</p>
</div>
"""

CTA_END = """
<div style="border-left: 4px solid #6B9BD1; background: #F9F9F9; padding: 25px 30px; margin: 40px 0; border-radius: 4px;">
    <h4 style="margin: 0 0 12px 0; color: #2D3436; font-size: 20px; font-weight: 600;">Ready for Better Sleep Tonight?</h4>
    <p style="margin: 0 0 18px 0; color: #636E72; font-size: 15px; line-height: 1.5;">Stop guessing. Get your baby's personalized sleep schedule based on their exact age, current habits, and your family's routine. Science-backed and customized in 60 seconds.</p>
    <a href="../index.html" style="display: inline-block; background: #6B9BD1; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">Start Free Assessment →</a>
</div>
"""


def generate_article(keyword, searches):
    """Generate a complete SEO article using Wavespeed AI"""
    
    prompt = f"""Write a comprehensive, SEO-optimized blog article about "{keyword}".

REQUIREMENTS:
- Title: Compelling H1 title including the keyword
- Length: 1800-2200 words
- Structure: Use H2 and H3 subheadings
- Tone: Empathetic, helpful, parent-to-parent advice
- Include: Practical tips, science-backed advice, real examples
- SEO: Use keyword naturally 5-7 times
- Format: HTML with proper tags (<h2>, <h3>, <p>, <ul>, <ol>)
- Add a FAQ section at the end with 5 questions

DO NOT include: Opening/closing HTML tags, just the article body content.
Start directly with the H1 title tag.

Make it helpful, engaging, and valuable for exhausted parents searching for sleep solutions."""

    headers = {
        "Authorization": f"Bearer {WAVESPEED_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "gpt-4",
        "messages": [
            {"role": "system", "content": "You are an expert baby sleep consultant and SEO content writer. Write helpful, empathetic articles for exhausted parents."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 3000
    }
    
    try:
        print(f"Generating article for: {keyword}...")
        response = requests.post(WAVESPEED_API_URL, headers=headers, json=data, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        article_content = result['choices'][0]['message']['content']
        
        return article_content
        
    except Exception as e:
        print(f"Error generating article: {e}")
        return None


def format_article_html(keyword, article_content, searches):
    """Format article with meta tags and CTAs"""
    
    # Generate slug
    slug = keyword.lower().replace(" ", "-")
    
    # Split article into parts to insert mid-article CTA
    parts = article_content.split("</h2>", 2)  # Split after 2nd H2
    
    if len(parts) >= 3:
        # Insert CTA after second section
        formatted_content = parts[0] + "</h2>" + parts[1] + "</h2>" + CTA_INLINE + parts[2]
    else:
        formatted_content = article_content + CTA_INLINE
    
    # Add end CTA
    formatted_content += CTA_END
    
    # Create full HTML
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{keyword.title()} - Complete Guide 2026</title>
    <meta name="description" content="Complete guide to {keyword}. Science-backed tips, schedules, and solutions for exhausted parents. Get your personalized sleep plan today!">
    <meta name="keywords" content="{keyword}, baby sleep, sleep schedule, sleep training">
    
    <!-- Google Analytics - ADD YOUR ID -->
    <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script> -->
    
    <link rel="stylesheet" href="../css/styles.css">
    <style>
        .article-container {{
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.8;
        }}
        .article-container h1 {{
            color: #2D3436;
            font-size: 36px;
            margin-bottom: 20px;
        }}
        .article-container h2 {{
            color: #6B9BD1;
            font-size: 28px;
            margin-top: 40px;
            margin-bottom: 15px;
        }}
        .article-container h3 {{
            color: #2D3436;
            font-size: 22px;
            margin-top: 30px;
            margin-bottom: 12px;
        }}
        .article-container p {{
            margin-bottom: 20px;
            color: #2D3436;
        }}
        .article-container ul, .article-container ol {{
            margin: 20px 0;
            padding-left: 30px;
        }}
        .article-container li {{
            margin-bottom: 10px;
        }}
    </style>
</head>
<body>
    <nav style="background: #6B9BD1; padding: 15px; text-align: center;">
        <a href="../index.html" style="color: white; margin: 0 15px; text-decoration: none;">Home</a>
        <a href="../quiz.html" style="color: white; margin: 0 15px; text-decoration: none;">Get Sleep Plan</a>
        <a href="index.html" style="color: white; margin: 0 15px; text-decoration: none;">Blog</a>
    </nav>

    <div class="article-container">
        {formatted_content}
        
        <div style="margin-top: 60px; padding-top: 30px; border-top: 2px solid #E5E5E5;">
            <p style="font-size: 14px; color: #636E72;"><strong>Medical Disclaimer:</strong> This content is for informational purposes only and is not a substitute for professional medical advice. Always consult your pediatrician about your baby's sleep and health.</p>
        </div>
    </div>

    <footer style="background: #2D3436; color: white; padding: 30px; text-align: center; margin-top: 60px;">
        <p>&copy; 2026 Baby Sleep Optimizer. All rights reserved.</p>
        <p><a href="../privacy.html" style="color: #F4E4D7;">Privacy Policy</a></p>
    </footer>
</body>
</html>"""
    
    return html, slug


def save_article(html_content, slug):
    """Save article to file"""
    
    # Create output folder if doesn't exist
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
    
    filename = f"{OUTPUT_FOLDER}/{slug}.html"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ Saved: {filename}")
    return filename


def generate_blog_index(articles):
    """Generate blog index page listing all articles"""
    
    article_list = ""
    for article in articles:
        article_list += f"""
        <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #E5E5E5; border-radius: 8px;">
            <h3><a href="{article['slug']}.html" style="color: #6B9BD1; text-decoration: none;">{article['keyword'].title()}</a></h3>
            <p style="color: #636E72;">Complete guide with tips, schedules, and solutions. {article['searches']:,} monthly searches.</p>
            <a href="{article['slug']}.html" style="color: #6B9BD1;">Read More →</a>
        </div>
        """
    
    index_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baby Sleep Tips & Guides - Blog</title>
    <meta name="description" content="Expert baby sleep tips, schedules, and solutions for exhausted parents.">
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
    <nav style="background: #6B9BD1; padding: 15px; text-align: center;">
        <a href="../index.html" style="color: white; margin: 0 15px; text-decoration: none;">Home</a>
        <a href="../quiz.html" style="color: white; margin: 0 15px; text-decoration: none;">Get Sleep Plan</a>
        <a href="index.html" style="color: white; margin: 0 15px; text-decoration: none;">Blog</a>
    </nav>

    <div style="max-width: 900px; margin: 40px auto; padding: 20px;">
        <h1 style="color: #2D3436; font-size: 42px; margin-bottom: 15px;">Baby Sleep Blog</h1>
        <p style="color: #636E72; font-size: 18px; margin-bottom: 40px;">Science-backed sleep tips and guides for exhausted parents</p>
        
        {article_list}
    </div>

    <footer style="background: #2D3436; color: white; padding: 30px; text-align: center; margin-top: 60px;">
        <p>&copy; 2026 Baby Sleep Optimizer. All rights reserved.</p>
    </footer>
</body>
</html>"""
    
    with open(f"{OUTPUT_FOLDER}/index.html", 'w', encoding='utf-8') as f:
        f.write(index_html)
    
    print(f"✓ Created blog index page")


def main():
    """Main function to generate all articles"""
    
    print("=" * 60)
    print("BULK SEO ARTICLE GENERATOR")
    print("=" * 60)
    print(f"\nGenerating {len(KEYWORDS)} articles...")
    print(f"Output folder: {OUTPUT_FOLDER}/\n")
    
    generated_articles = []
    
    for i, item in enumerate(KEYWORDS, 1):
        keyword = item['keyword']
        searches = item['monthly_searches']
        
        print(f"\n[{i}/{len(KEYWORDS)}] Processing: {keyword}")
        print(f"Monthly searches: {searches:,}")
        
        # Generate article content
        article_content = generate_article(keyword, searches)
        
        if article_content:
            # Format with CTAs and HTML
            html, slug = format_article_html(keyword, article_content, searches)
            
            # Save to file
            filename = save_article(html, slug)
            
            generated_articles.append({
                'keyword': keyword,
                'slug': slug,
                'searches': searches,
                'filename': filename
            })
            
            print(f"✓ Complete!")
            
            # Rate limiting - wait between requests
            if i < len(KEYWORDS):
                print("Waiting 3 seconds...")
                time.sleep(3)
        else:
            print(f"✗ Failed to generate article")
    
    # Generate blog index page
    print("\n" + "=" * 60)
    generate_blog_index(generated_articles)
    
    # Summary
    print("\n" + "=" * 60)
    print("GENERATION COMPLETE!")
    print("=" * 60)
    print(f"\nGenerated: {len(generated_articles)} articles")
    print(f"Location: {OUTPUT_FOLDER}/")
    print(f"\nTotal potential monthly traffic: {sum(item['searches'] for item in KEYWORDS):,} visitors")
    print("\nNext steps:")
    print("1. Review articles in generated_articles/ folder")
    print("2. Upload to Orangehost in blog/ directory")
    print("3. Submit sitemap to Google Search Console")
    print("4. Watch traffic grow! 🚀")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
