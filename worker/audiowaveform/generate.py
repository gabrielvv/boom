import subprocess
from os import listdir, path, remove
import logging
import json


def change_extension(filepath, ext):
    path_tuple = list(path.splitext(filepath))
    return ''.join((
        path_tuple[0],
        ext
    ))


def generate_waveforms(output_dir_name):
    logging.info('generate_waveforms')
    waveforms = {}

    for output_file_name in listdir(output_dir_name):
        local_path = path.join(output_dir_name, output_file_name)
        local_output_file = change_extension(local_path, '.json')
        waveforms[output_file_name] = generate_waveform(
            local_path, local_output_file)
        remove(local_output_file)

    return waveforms


def scale_json(filename):
    """
    see https://wavesurfer-js.org/faq/
    """
    with open(filename, "r") as f:
        file_content = f.read()

    json_content = json.loads(file_content)
    data = json_content["data"]
    # number of decimals to use when rounding the peak value
    digits = 2

    max_val = float(max(data))
    new_data = []
    for x in data:
        new_data.append(round(x / max_val, digits))

    json_content["data"] = new_data
    return json.dumps(json_content, separators=(',', ':'))


def generate_waveform(input_file_name, output_file_name):
    """
    see https://wavesurfer-js.org/faq/
    """
    logging.info(
        f'generate_waveform input={input_file_name} output={output_file_name}')
    args = f'audiowaveform -i {input_file_name} -o {output_file_name} --pixels-per-second 20 --bits 8'.split()
    popen = subprocess.Popen(args, stdout=subprocess.PIPE)
    popen.wait()
    # popen.stdout.read()
    return scale_json(output_file_name)
