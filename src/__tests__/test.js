import convertToJcamp from '..';
import {convert} from 'jcampconverter';

describe('convertToJcamp', () => {
    it('check valid with jcampconverter', () => {
        const testData = `1 2
2 3
3 4
4 5
5 6
6 7
7 8
8 9`;
        var options = {
            title: 'test',
            owner: 'cheminfo',
            origin: 'manually',
            type: 'MASS SPECTRUM',
            xUnit: 'M/Z',
            yUnit: 'relative abundance',
            info: {
                info1: 'value1',
                info2: 'value2'
            }
        };
        var jcamp = convertToJcamp(testData, options);
        var jcampObject = convert(jcamp);

        expect(jcampObject.spectra).toEqual([
            {
                data: [[
                    1, 2,
                    2, 3,
                    3, 4,
                    4, 5,
                    5, 6,
                    6, 7,
                    7, 8,
                    8, 9
                ]],
                dataType: 'MASS SPECTRUM',
                firstX: 1,
                firstY: 2,
                isPeaktable: true,
                lastX: 8,
                lastY: 9,
                nbPoints: 8,
                title: 'test',
                xFactor: 1,
                xUnit: 'M/Z',
                yFactor: 1,
                yUnit: 'relative abundance'
            }
        ]);
    });

    it('check with default values', () => {
        const testData = `2 3
1 2
3 4
-4 5
5 16
6 7
7 8
8 9`;

        var jcamp = convertToJcamp(testData);
        var jcampObject = convert(jcamp);

        expect(jcampObject.spectra).toEqual([{
            data: [[
                2, 3,
                1, 2,
                3, 4,
                5, 16,
                6, 7,
                7, 8,
                8, 9
            ]],
            dataType: '',
            firstX: 1,
            firstY: 2,
            isPeaktable: true,
            lastX: 8,
            lastY: 16,
            nbPoints: 7,
            title: '',
            xFactor: 1,
            xUnit: '',
            yFactor: 1,
            yUnit: ''
        }]);
    });
});
