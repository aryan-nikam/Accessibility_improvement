from difflib import SequenceMatcher

# Function to convert text to Braille (mock implementation)
def convert_to_braille(text):
    braille_map = {
        'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
        'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
        'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕',
        'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
        'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽',
        'z': '⠵', ' ': ' '
    }
    braille_text = ''.join(braille_map.get(c, '') for c in text.lower())
    return braille_text

def evaluate_accuracy(original_text, braille_text):
    # Convert original text to Braille using the same Braille conversion logic
    original_braille = convert_to_braille(original_text)

    # Calculate accuracy using SequenceMatcher
    similarity = SequenceMatcher(None, original_braille, braille_text).ratio()

    # Return accuracy as a percentage
    return similarity * 100
