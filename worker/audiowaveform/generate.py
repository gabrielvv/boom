import subprocess
from os import listdir, path
import logging


def change_extension(filepath, ext):
    path_tuple = list(path.splitext(filepath))
    return ''.join((
        path_tuple[0],
        ext
    ))


def generate_waveforms(output_s3_dir_name, output_dir_name):
    logging.info('generate_waveforms')
    object_list = []

    for output_file_name in listdir(output_dir_name):
        local_path = path.join(output_dir_name, output_file_name)
        object_name = '/'.join((
            output_s3_dir_name,
            change_extension(output_file_name, '.json')
        ))
        local_output_file = change_extension(local_path, '.json')
        generate_waveform(local_path, local_output_file)
        object_list += object_name

    return object_list


def generate_waveform(input_file_name, output_file_name):
    """
    see https://wavesurfer-js.org/faq/
    """
    logging.info(
        f'generate_waveform input={input_file_name} output={output_file_name}')
    args = f'audiowaveform -i {input_file_name} -o {output_file_name} --pixels-per-second 20 --bits 8'.split()
    popen = subprocess.Popen(args, stdout=subprocess.PIPE)
    popen.wait()
    return popen.stdout.read()
