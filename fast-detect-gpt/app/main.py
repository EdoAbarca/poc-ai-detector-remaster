from flask import Flask, request, jsonify
import subprocess
import json
import os
import torch

app = Flask(__name__)


@app.route("/fast-detect-gpt/detect", methods=["POST", "GET"])
def detect():
    if request.method == "POST":
        try:
            data = request.get_json()
            text = data.get("text", None)

            if not text:
                return jsonify({"error": "No text provided"}), 400

            print(f"Processing text: {text}")

            # Get the path to the infer.py script
            script_dir = os.path.join(os.path.dirname(__file__), "scripts")
            filepath = os.path.join(script_dir, "infer.py")

            # Use sys.executable to ensure we use the same Python interpreter
            import sys

            parameters = [sys.executable, filepath, "--text", text]

            # Run the subprocess and capture the output (20 minute timeout for model loading with offloading)
            print(f"[main.py] Starting inference with 20-minute timeout...")
            result = subprocess.run(parameters, capture_output=True, text=True)

            if result.returncode == 0:
                # Split the output into lines and get the last line
                output_lines = result.stdout.splitlines()

                if not output_lines:
                    return (
                        jsonify(
                            {
                                "error": "No output from inference script",
                                "stderr": result.stderr,
                                "stdout": result.stdout,
                            }
                        ),
                        500,
                    )

                # Extract the last element
                last_element = output_lines[-1]

                # Parse the JSON string into a Python dictionary
                try:
                    output_dict = json.loads(last_element)
                    print("Output from infer.py:", output_dict)
                    return jsonify(output_dict), 200
                except json.JSONDecodeError as e:
                    return (
                        jsonify(
                            {
                                "error": f"Failed to parse JSON: {str(e)}",
                                "last_line": last_element,
                                "all_output": result.stdout,
                            }
                        ),
                        500,
                    )
            else:
                return (
                    jsonify(
                        {
                            "Code": result.returncode,
                            "Stderr": f"Error running infer.py. Error: {result.stderr}",
                            "Stdout": result.stdout,
                        }
                    ),
                    400,
                )

        except subprocess.TimeoutExpired:
            return (
                jsonify({"error": "Inference timeout - processing took too long (>60s)"}),
                504,
            )
        except json.JSONDecodeError as e:
            return jsonify({"error": f"JSON parsing error: {str(e)}"}), 500
        except Exception as e:
            import traceback

            return (
                jsonify(
                    {
                        "error": f"Exception: {str(e)}",
                        "traceback": traceback.format_exc(),
                    }
                ),
                400,
            )

    elif request.method == "GET":
        try:
            data_response = {
                "cuda_available": torch.cuda.is_available(),
                "cuda_device_count": torch.cuda.device_count(),
                "cuda_current_device": (torch.cuda.current_device() if torch.cuda.is_available() else None),
                "cuda_device_name": (torch.cuda.get_device_name(0) if torch.cuda.is_available() else None),
            }
            return jsonify(data_response), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 400


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8001, debug=True)
