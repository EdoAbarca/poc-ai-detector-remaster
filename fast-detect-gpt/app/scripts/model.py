# Copyright (c) Guangsheng Bao.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import time
import os

def get_base_route(model_name, cache_dir):
    print("[model.py] (get_base_route) Se busca modelo/tokenizador en el cache local")
    #local_path = os.path.join(os.path.join(cache_dir, 'models--' + model_name.replace("/", "--")), 'snapshots')
    local_path = os.path.join(cache_dir, 'models--' + model_name.replace("/", "--"))
    print("[model.py] (get_base_route) Ruta local generada: ", local_path)
    return local_path

def get_model(model_name, kwargs, cache_dir):
    local_path = get_base_route(model_name, cache_dir)
    
    # Environment-based optimization
    # Development (GPT-2): Minimal resources needed
    # Production (GPT-J-6B): GPU-accelerated with offloading
    env = os.getenv('ENVIRONMENT', 'development').lower()
    
    if env == 'production':
        # Production: Optimize for GPT-J-6B with GPU offloading
        max_memory = {0: "20GB", "cpu": "40GB"}  # Large model support
        device_map = 'balanced_low_0'
        print(f"[model.py] (get_model) PRODUCTION mode: GPU offloading enabled")
    else:
        # Development: GPT-2 runs entirely on available resources
        max_memory = None  # Auto-allocate for small model
        device_map = 'auto'
        print(f"[model.py] (get_model) DEVELOPMENT mode: Auto resource allocation")
    
    print(f"[model.py] (get_model) Loading model {model_name}...")
    
    if os.path.exists(local_path):
        print("[model.py] (get_model) Ruta local existe, posiblemente los archivos estén en caché")
        # Variable to track whether 'config.json' was found
        # We assume that if 'config.json' is found, then the model is found (model) / if 'config_tokenizer.json' is found, then the tokenizer is found (tokenizer)
        print(f"[model.py] (get_model) Buscando modelo ('config.json') en: {local_path}")
        config_found = False
        # Search for "config.json" in the specified directory and its subdirectories
        for folder_path, _, files in os.walk(local_path):
            if "config.json" in files:
                config_found = True
                #model_path = os.path.join(folder_path, "config.json")
                model_path = folder_path
                print(f"[model.py] (get_model) 'config.json' encontrado en: {model_path}")
        if config_found:
            #return AutoModelForCausalLM.from_pretrained(model_path, **kwargs)
            print("[model.py] (get_model) Cargando modelo desde caché local...")
            try:
                # Load with environment-appropriate settings
                load_kwargs = {
                    'cache_dir': cache_dir,
                    'torch_dtype': torch.float16,
                    'device_map': device_map,
                    'low_cpu_mem_usage': True,
                }
                
                # Add memory limits only for production
                if max_memory:
                    load_kwargs['max_memory'] = max_memory
                    load_kwargs['offload_folder'] = "offload"
                    load_kwargs['offload_state_dict'] = True
                
                model = AutoModelForCausalLM.from_pretrained(model_path, **load_kwargs)
                print("[model.py] (get_model) Modelo cargado exitosamente")
                return model
            except (OSError, RuntimeError) as e:
                print(f"[model.py] (get_model) Error loading cached model: {e}")
                print("[model.py] (get_model) Falling back to downloading from Hugging Face...")
                
                load_kwargs = {
                    'cache_dir': cache_dir,
                    'torch_dtype': torch.float16,
                    'device_map': device_map,
                    'low_cpu_mem_usage': True,
                }
                
                if max_memory:
                    load_kwargs['max_memory'] = max_memory
                    load_kwargs['offload_folder'] = "offload"
                    load_kwargs['offload_state_dict'] = True
                
                model = AutoModelForCausalLM.from_pretrained(model_name, **load_kwargs)
                print("[model.py] (get_model) Modelo cargado exitosamente")
                return model
        else:
            print(f"[model.py] (get_model) Model '{model_name}' no encontrado en caché")
            print("[model.py] (get_model) Cargando modelo desde Hugging Face...")
            
            load_kwargs = {
                'cache_dir': cache_dir,
                'torch_dtype': torch.float16,
                'device_map': device_map,
                'low_cpu_mem_usage': True,
            }
            
            if max_memory:
                load_kwargs['max_memory'] = max_memory
                load_kwargs['offload_folder'] = "offload"
                load_kwargs['offload_state_dict'] = True
            
            model = AutoModelForCausalLM.from_pretrained(model_name, **load_kwargs)
            print("[model.py] (get_model) Modelo cargado exitosamente")
            return model
    else:
        print("[model.py] (get_model) Ruta local no existe")
        print("[model.py] (get_model) Cargando modelo desde Hugging Face...")
        
        load_kwargs = {
            'cache_dir': cache_dir,
            'torch_dtype': torch.float16,
            'device_map': device_map,
            'low_cpu_mem_usage': True,
        }
        
        if max_memory:
            load_kwargs['max_memory'] = max_memory
            load_kwargs['offload_folder'] = "offload"
            load_kwargs['offload_state_dict'] = True
        
        model = AutoModelForCausalLM.from_pretrained(model_name, **load_kwargs)
        print("[model.py] (get_model) Modelo cargado exitosamente")
        return model

def get_tokenizer(model_name, kwargs, cache_dir):
    local_path = get_base_route(model_name, cache_dir)
    if os.path.exists(local_path):
        print("[model.py] (get_tokenizer) Ruta local existe, posiblemente los archivos estén en caché")
        # Variable to track whether 'config_tokenizer.json' was found
        # We assume that if 'config.json' was found, then the model is found (model) / if 'config_tokenizer.json' was found, then the tokenizer is found (tokenizer)
        print(f"[model.py] (get_tokenizer) Buscando tokenizador ('config_tokenizer.json') en: {local_path}")
        config_tokenizer_found = False
        # Search for "config._tokenizer.json" in the specified directory and its subdirectories
        for folder_path, _, files in os.walk(local_path):
            if "tokenizer_config.json" in files:
                config_tokenizer_found = True
                #config_file_path = os.path.join(folder_path, "config_tokenizer.json")
                tokenizer_path = folder_path
                print(f"[model.py] (get_tokenizer) 'config_tokenizer.json' encontrado en: {tokenizer_path}")
        if config_tokenizer_found:
            return AutoTokenizer.from_pretrained(tokenizer_path, **kwargs)
        else:
            print(f"[model.py] (get_tokenizer) Tokenizer '{model_name}' no encontrado")
            return AutoTokenizer.from_pretrained(model_name, **kwargs, cache_dir=cache_dir) #Falla, integrar en un try-catch, ejecutar con ruta local despues de la falla (modelo ya estará descargado en caché local)
    else:
        print("[model.py] (get_tokenizer) Ruta local no existe, se descargará el tokenizador")
        return AutoTokenizer.from_pretrained(model_name, **kwargs, cache_dir=cache_dir) #Falla, integrar en un try-catch, ejecutar con ruta local despues de la falla (modelo ya estará descargado en caché local)

# predefined models
model_fullnames = {  'gpt2': 'gpt2',
                     'gpt2-xl': 'gpt2-xl',
                     'opt-2.7b': 'facebook/opt-2.7b',
                     'gpt-neo-2.7B': 'EleutherAI/gpt-neo-2.7B',
                     'gpt-j-6B': 'EleutherAI/gpt-j-6B',
                     'gpt-neox-20b': 'EleutherAI/gpt-neox-20b',
                     'mgpt': 'sberbank-ai/mGPT',
                     'pubmedgpt': 'stanford-crfm/pubmedgpt',
                     'mt5-xl': 'google/mt5-xl',
                     'llama-13b': 'huggyllama/llama-13b',
                     'llama2-13b': 'TheBloke/Llama-2-13B-fp16',
                     'bloom-7b1': 'bigscience/bloom-7b1',
                     'opt-13b': 'facebook/opt-13b',
                     }
float16_models = ['gpt-j-6B', 'gpt-neox-20b', 'llama-13b', 'llama2-13b', 'bloom-7b1', 'opt-13b']

def get_model_fullname(model_name):
    return model_fullnames[model_name] if model_name in model_fullnames else model_name

def load_model(model_name, cache_dir):
    model_fullname = get_model_fullname(model_name)
    print(f'[model.py] (load_model.py) Loading model {model_fullname}...')
    model_kwargs = {}
    if model_name in float16_models:
        model_kwargs.update(dict(torch_dtype=torch.float16))
    if 'gpt-j' in model_name:
        model_kwargs.update(dict(revision='float16'))
    print("[model.py] (load_model.py) cargando modelo...")
    model_kwargs.update(dict(low_cpu_mem_usage=True))
    model = get_model(model_fullname, model_kwargs, cache_dir)
    print("[model.py] (load_model.py) modelo cargado. Modelo: ", model)
    #print('[model.py] (load_model.py) Moving model to GPU...', end='', flush=True)
    #start = time.time()
    #model.to(device)
    #print(f'[model.py] (load_model.py) DONE ({time.time() - start:.2f}s)')
    return model

def load_tokenizer(model_name, for_dataset, cache_dir):
    model_fullname = get_model_fullname(model_name)
    print(f'[model.py] (load_tokenizer.py) Loading tokenizer {model_fullname}...')
    optional_tok_kwargs = {}
    if "facebook/opt-" in model_fullname:
        print("[model.py] (load_tokenizer.py) Using non-fast tokenizer for OPT")
        optional_tok_kwargs['fast'] = False
    if for_dataset in ['pubmed']:
        optional_tok_kwargs['padding_side'] = 'left'
    else:
        optional_tok_kwargs['padding_side'] = 'right'
    print("[model.py] (load_tokenizer.py) cargando tokenizador...")
    base_tokenizer = get_tokenizer(model_fullname, optional_tok_kwargs, cache_dir=cache_dir)
    print("[model.py] (load_tokenizer.py) tokenizador cargado. Tokenizador: ", base_tokenizer)
    if base_tokenizer.pad_token_id is None:
        base_tokenizer.pad_token_id = base_tokenizer.eos_token_id
        if '13b' in model_fullname:
            base_tokenizer.pad_token_id = 0
    return base_tokenizer

'''
if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--model_name', type=str, default="bloom-7b1")
    parser.add_argument('--cache_dir', type=str, default="../cache")
    args = parser.parse_args()

    load_tokenizer(args.model_name, 'xsum', args.cache_dir)
    load_model(args.model_name, 'cpu', args.cache_dir)
'''

