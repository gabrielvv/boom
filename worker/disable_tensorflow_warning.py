import logging
import warnings

# See https://github.com/tensorflow/tensorflow/issues/8340#issuecomment-332212742
logging.getLogger('tensorflow').disabled = True

# See https://stackoverflow.com/questions/29347987/why-cant-i-suppress-numpy-warnings
warnings.filterwarnings('ignore')
