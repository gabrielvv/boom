from spleeter.separator import Separator
import logging


def split(file_name, dir_name, model='2stems'):
    """
    see https://github.com/deezer/spleeter/wiki/4.-API-Reference#file-based-separation
    see https://github.com/deezer/spleeter/wiki/4.-API-Reference#asynchronous-audio-export
    see https://github.com/deezer/spleeter/issues/311
    """
    logging.info(
        f'separator not found for model {model}:'
        + ' a new separator will be created'
    )
    stft_backend = 'auto'
    separator = Separator('spleeter:' + model, stft_backend=stft_backend)
    return separator.separate_to_file(file_name, dir_name, synchronous=True)
