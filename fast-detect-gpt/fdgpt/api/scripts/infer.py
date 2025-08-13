# Copyright (c) Guangsheng Bao.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
# Copy from local_infer.py

import numpy as np
import torch
import os
import glob
import argparse
import json
from model import load_tokenizer, load_model
from fast_detect_gpt import get_sampling_discrepancy_analytic

# estimate the probability according to the distribution of our test results on ChatGPT and GPT-4
class ProbEstimator:
    def __init__(self, args):
        self.real_crits = []
        self.fake_crits = []
        # Define the path to "folder b" relative to the current working directory
        prob_path = os.path.join(os.path.dirname(__file__), '..', 'local_infer_ref')

        # List all files in "folder b"
        prob_files = os.listdir(prob_path)

        # Filter out JSON files
        json_files = [os.path.join(prob_path, file) for file in prob_files if file.endswith('.json')]
      
        #for result_file in glob.glob(os.path.join(args.ref_path, '*.json')):
        for result_file in json_files:
            #print("[infer.py] (ProbEstimator class) Main result file: ", glob.glob(args.ref_path))
            #print("[infer.py] (ProbEstimator class) Result file: ", result_file)
            with open(result_file, 'r') as fin:
                res = json.load(fin)
                self.real_crits.extend(res['predictions']['real'])
                self.fake_crits.extend(res['predictions']['samples'])
        print(f'ProbEstimator: total {len(self.real_crits) * 2} samples.')


    def crit_to_prob(self, crit):
        offset = np.sort(np.abs(np.array(self.real_crits + self.fake_crits) - crit))[100]
        cnt_real = np.sum((np.array(self.real_crits) > crit - offset) & (np.array(self.real_crits) < crit + offset))
        cnt_fake = np.sum((np.array(self.fake_crits) > crit - offset) & (np.array(self.fake_crits) < crit + offset))
        return cnt_fake / (cnt_real + cnt_fake)

# run interactive local inference
def run(args):
    # load model
    scoring_model = load_model(args.scoring_model_name, args, args.cache_dir)
    scoring_model.eval()
    scoring_tokenizer = load_tokenizer(args.scoring_model_name, args, args.cache_dir)
    
    if args.reference_model_name != args.scoring_model_name:
        reference_tokenizer = load_tokenizer(args.reference_model_name, args.dataset, args.cache_dir)
        reference_model = load_model(args.reference_model_name, args.device, args.cache_dir)
        reference_model.eval()
    # evaluate criterion
    criterion_fn = get_sampling_discrepancy_analytic
    prob_estimator = ProbEstimator(args)
    # input text
    print('Local demo for Fast-DetectGPT, where the longer text has more reliable result.')
    print('')
    text = args.text
    tokenized = scoring_tokenizer(text, return_tensors="pt", padding=True, return_token_type_ids=False).to(args.device)
    labels = tokenized.input_ids[:, 1:]
    with torch.no_grad():
        logits_score = scoring_model(**tokenized).logits[:, :-1]
        if args.reference_model_name == args.scoring_model_name:
            logits_ref = logits_score
        else:
            tokenized = reference_tokenizer(text, return_tensors="pt", padding=True, return_token_type_ids=False).to(args.device)
            assert torch.all(tokenized.input_ids[:, 1:] == labels), "Tokenizer is mismatch."
            logits_ref = reference_model(**tokenized).logits[:, :-1]
        crit = criterion_fn(logits_ref, logits_score, labels)
    # estimate the probability of machine generated text
    prob = prob_estimator.crit_to_prob(crit)
    # print result
    print(f'Fast-DetectGPT criterion is {crit:.4f}, suggesting that the text has a probability of {prob * 100:.0f}% to be fake.')
    # create result
    result = {
        "criterion": crit,
        "ai_score": prob * 100,
        "ai_result": "Human" if prob < 0.5 else "AI"
    }

    print(result) #A capturar en proceso principal
    #return result #no es posible leer resultado, se escribe en json

    '''
    while True:
        print("Please enter your text: (Press Enter twice to start processing)")
        lines = []
        while True:
            line = input()
            if len(line) == 0:
                break
            lines.append(line)
        text = "\n".join(lines)
        if len(text) == 0:
            break
        # evaluate text
        tokenized = scoring_tokenizer(text, return_tensors="pt", padding=True, return_token_type_ids=False).to(args.device)
        labels = tokenized.input_ids[:, 1:]
        with torch.no_grad():
            logits_score = scoring_model(**tokenized).logits[:, :-1]
            if args.reference_model_name == args.scoring_model_name:
                logits_ref = logits_score
            else:
                tokenized = reference_tokenizer(text, return_tensors="pt", padding=True, return_token_type_ids=False).to(args.device)
                assert torch.all(tokenized.input_ids[:, 1:] == labels), "Tokenizer is mismatch."
                logits_ref = reference_model(**tokenized).logits[:, :-1]
            crit = criterion_fn(logits_ref, logits_score, labels)
        # estimate the probability of machine generated text
        prob = prob_estimator.crit_to_prob(crit)
        # print result
        # Estudiar crit y prob, retornar prob:
        print(f'Fast-DetectGPT criterion is {crit:.4f}, suggesting that the text has a probability of {prob * 100:.0f}% to be fake.')
        print()
    '''

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--reference_model_name', type=str, default="gpt-neo-2.7B")  # use gpt-j-6B for more accurate detection
    parser.add_argument('--scoring_model_name', type=str, default="gpt-neo-2.7B") # old model gpt-neo-2.7B
    parser.add_argument('--dataset', type=str, default="xsum")
    parser.add_argument('--ref_path', type=str, default="./local_infer_ref")
    parser.add_argument('--device', type=str, default="cuda")
    parser.add_argument('--cache_dir', type=str, default="../cache")
    parser.add_argument('--text', type=str, default="") # text to evaluate
    args = parser.parse_args()

    run(args)
