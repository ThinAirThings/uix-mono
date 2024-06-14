import { Text } from 'ink';
import terminalImage from 'terminal-image';
import React from 'react';
import propTypes from 'prop-types';

const { useState, useEffect } = React;

export const Image = (props: any) => {
    const [imageData, setImageData] = useState('');

    useEffect(() => {
        (async () => {
            setImageData(await terminalImage.file(props.src, props));
        })();
    }, [props]);

    return <Text>{imageData}</Text>;
};

Image.propTypes = {
    src: propTypes.oneOfType([
        propTypes.object,
        propTypes.string
    ]).isRequired,
    width: propTypes.oneOfType([
        propTypes.number,
        propTypes.string
    ]),
    height: propTypes.oneOfType([
        propTypes.number,
        propTypes.string
    ]),
    preserveAspectRatio: propTypes.bool,
    maximumFrameRate: propTypes.number
};

Image.defaultProps = {
    width: '100%',
    height: '100%',
    preserveAspectRatio: true,
    maximumFrameRate: 30
};
