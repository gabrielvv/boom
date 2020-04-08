from spleeter.separator import Separator


def separate(file_name, dir_name, model='2stems'):
    separator = Separator('spleeter:' + model)
    separator.separate_to_file(file_name, dir_name)
