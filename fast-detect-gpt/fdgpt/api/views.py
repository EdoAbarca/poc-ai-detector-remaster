from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import subprocess
import json
import os
import torch

# Create your views here.
class FastDetectGPTView(APIView):
  def post(self, request):
    try:
      text = request.data.get("text", None)
      print(text)
      filepath = os.path.join(os.path.join(os.path.dirname(__file__), 'scripts'), 'infer.py')

      parameters = ["python3", filepath, "--text", text]

      # Run the subprocess and capture the output
      result = subprocess.run(parameters, capture_output=True, text=True)

      if result.returncode == 0:
        # Split the output into lines and get the last line
        output_lines = result.stdout.splitlines()

        # Extract the last element
        last_element = output_lines[-1]

        # Parse the JSON string into a Python dictionary
        output_dict = json.loads(last_element)

        # Now you can use output_dict as a regular Python dictionary
        print("Output from infer.py:", output_dict)
        return Response(output_dict,status=status.HTTP_200_OK)
      else:
        #print("Error running infer.py. Return code:", result.returncode)
        #print(result)
        return Response({"Code":result.returncode, "Stderr": "Error running infer.py. Error: "+result.stderr, "Stdout":result.stdout}, status=status.HTTP_400_BAD_REQUEST)
      
    except Exception as e:
      return Response("Exception: "+str(e),status=status.HTTP_400_BAD_REQUEST)
    
  def get(self, request):
    try:
      data_response = {
        "cuda_available": torch.cuda.is_available(),
        "cuda_device_count": torch.cuda.device_count(),
        "cuda_current_device": torch.cuda.current_device(),
        "cuda_device_name": torch.cuda.get_device_name(0)
      }
      return Response(data_response,status=status.HTTP_200_OK)
    except Exception as e:
      return Response(str(e),status=status.HTTP_400_BAD_REQUEST)