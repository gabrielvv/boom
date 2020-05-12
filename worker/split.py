from spleeter.separator import Separator
import logging


separator_list = {
    '2stems': None,
    '4stems': None,
    '5stems': None
}


def split(file_name, dir_name, model='2stems'):
    """
    see https://github.com/deezer/spleeter/wiki/4.-API-Reference#file-based-separation
    see https://github.com/deezer/spleeter/wiki/4.-API-Reference#asynchronous-audio-export
    see https://github.com/deezer/spleeter/issues/311
    """
    separator = separator_list.get(model)
    if not separator:
        logging.info(
            f'separator not found for model {model}:'
            + ' a new separator will be created'
        )
        stft_backend = 'auto'
        separator = Separator('spleeter:' + model, stft_backend=stft_backend)
        separator_list[model] = separator
    return separator.separate_to_file(
        file_name, dir_name, synchronous=True, codec='mp3')
