import 'core-js/modules/es.array.find-index';
import {format, parse} from 'date-fns/esm';
import * as locales from 'date-fns/locale';

const DateFns = {format, parse, locales};
window['DateFns'] = DateFns;

export default DateFns;
