from spleeter.separator import Separator

separator_list = {
    '2stems': None,
    '4stems': None,
    '5stems': None
}


def separate(file_name, dir_name, model='2stems'):
    """
    see https://github.com/deezer/spleeter/wiki/4.-API-Reference#file-based-separation
    see https://github.com/deezer/spleeter/wiki/4.-API-Reference#asynchronous-audio-export
    """
    separator = separator_list.get(model)
    if not separator:
        separator = Separator('spleeter:' + model, stft_backend='tensorflow')
        separator_list[model] = separator
    return separator.separate_to_file(file_name, dir_name, synchronous=True)
