import re
from typing import List
from sentence_transformers import util


def filter_descriptions(descriptions: List[str], word: str) -> List[str]:
    pattern = re.compile(rf"\b{word}\b", re.IGNORECASE)
    filtered_descriptions = [
        description
        for description in descriptions
        if len(pattern.findall(description)) <= 1
    ]
    if len(filtered_descriptions) == 0:
        return descriptions
    return filtered_descriptions

def sanitize_text(text: str):
    return (
        text.replace("<pad>", "").replace("</s>", "").replace(".", "").strip().lower()
    )

def get_description_prompts(word: str):
    prompts = [
        f"Provide a descriptive, unique, and informative one-sentence explanation of '{word}' that would help someone guess the word without directly using the word itself.",
        f"Craft a clever, indirect description of '{word}' that hints at its meaning without explicitly stating it.",
        f"Compose a single sentence that captures the essence of '{word}' without directly mentioning the word itself.",
    ]
    return prompts

def get_solve_prompts(description: str, history: str):
    prompts = [
        f"Guess the word that is being described: {description}. Your role is to respond with the word that you think is being described.",
        f"Try to identify the word that is being described: {description}. Provide the word that you believe matches the description.",
    ]
    if history.strip() != "":
        prompts.append(f"Guess the word that is being described: {description}. These are additional hints: {history}. Your role is to respond with the word that you think is being described.")
        prompts.append(f"Try to identify the word that is being described: {description}. These are additional hints: {history}. Provide the word that you believe matches the description.")
    return prompts

def pick_best_option(options: List[str], word: str, model):
    embeddings = model.encode([word] + options)
    word_embedding = embeddings[0]
    similarities = [
        util.cos_sim(word_embedding, desc_embedding)[0][0].item()
        for desc_embedding in embeddings[1:]
    ]
    best_option_index = similarities.index(max(similarities))
    return options[best_option_index]
