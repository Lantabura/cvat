// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Text from 'antd/lib/typography/Text';
import Button from 'antd/lib/button';

import { getCore, AnnotationGuide } from 'cvat-core-wrapper';
import CVATLoadingSpinner from 'components/common/loading-spinner';
import CVATMarkdown from 'components/common/cvat-markdown';

const core = getCore();

interface Props {
    instanceType: 'task' | 'project';
    id: number;
}

function MdGuideControl(props: Props): JSX.Element {
    const { instanceType, id } = props;
    const history = useHistory();
    const [guide, setGuide] = useState<AnnotationGuide | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const promise = instanceType === 'project' ? core.projects.get({ id }) : core.tasks.get({ id });
        promise
            .then((result) => result[0]?.guide())
            .then((existingGuide: AnnotationGuide | null) => {
                if (isMounted) {
                    setGuide(existingGuide);
                }
            })
            .catch(() => {
                // Ignore error if guide does not exist
            })
            .finally(() => {
                if (isMounted) {
                    setFetching(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [instanceType, id]);

    return (
        <Row justify='start' className='cvat-md-guide-control-wrapper'>
            <Col span={24}>
                <div className='cvat-md-guide-header'>
                    <Text strong className='cvat-text-color'>
                        {`${instanceType[0].toUpperCase()}${instanceType.slice(1)} description`}
                    </Text>
                    <Button
                        size='small'
                        onClick={() => {
                            history.push(`/${instanceType}s/${id}/guide`);
                        }}
                    >
                        Edit
                    </Button>
                </div>
                {fetching ? (
                    <CVATLoadingSpinner size='small' />
                ) : guide?.markdown ? (
                    <div className='cvat-md-guide-content'>
                        <CVATMarkdown history={history}>{guide.markdown}</CVATMarkdown>
                    </div>
                ) : (
                    <Text type='secondary' italic className='cvat-md-guide-empty'>
                        No description provided.
                    </Text>
                )}
            </Col>
        </Row>
    );
}

export default React.memo(MdGuideControl);
