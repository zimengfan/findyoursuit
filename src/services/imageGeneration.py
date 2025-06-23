import os
import sys
from http import HTTPStatus
from dashscope import ImageSynthesis

def generate_outfit_views(base_prompt, size='576*1024', steps=4, guidance=7.5):
    """
    Generate three views of an outfit using DashScope's FLUX model.
    
    Args:
        base_prompt (str): The base description of the outfit
        size (str): Image resolution (default: '576*1024' for portrait)
        steps (int): Number of inference steps (default: 4 for flux-schnell)
        guidance (float): Guidance scale for text adherence (default: 7.5)
        
    Returns:
        list: List of URLs for the generated images [front, side, back] or empty list if failed
    """
    views = [
        (", front view, facing camera", []),
        (", side view, profile shot", []),
        (", back view, showing suit from behind", [])
    ]
    
    try:
        api_key = os.getenv('DASHSCOPE_API_KEY')
        if not api_key:
            raise ValueError("DASHSCOPE_API_KEY environment variable not set")

        results = []
        for view_prompt, _ in views:
            full_prompt = f"{base_prompt}{view_prompt}"
            print(f"Generating {view_prompt.strip()} image...")
            
            response = ImageSynthesis.async_call(
                model="flux-schnell",
                prompt=full_prompt,
                size=size,
                steps=steps,
                guidance=guidance
            )

            if response.status_code != HTTPStatus.OK:
                print(f'Failed to submit job: {response.code} - {response.message}')
                continue

            final_response = ImageSynthesis.wait(response)
            
            if final_response.status_code == HTTPStatus.OK:
                if final_response.output.results and len(final_response.output.results) > 0:
                    results.append(final_response.output.results[0].url)
                    print(f"Successfully generated {view_prompt.strip()} image")
                else:
                    print('No results in successful response')
            else:
                print(f'Task failed: {final_response.code} - {final_response.message}')

        return results

    except Exception as e:
        print(f'Error generating images: {str(e)}')
        return []

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Error: Please provide a prompt as a command line argument")
        sys.exit(1)
        
    base_prompt = sys.argv[1]
    results = generate_outfit_views(base_prompt)
    
    if results:
        print("Generated image URLs:")
        for i, url in enumerate(results):
            print(f"{i+1}. {url}")
    else:
        print("Failed to generate images")
        sys.exit(1) 