import React from 'react';
import { Badge } from 'react-bootstrap';
import { Row } from 'reactstrap';

function CardList(props) {
  const {
    classHeaderTitle,
    colorBadge,
    withBadgePill,
    withBadge,
    badgeTextColor,
    withSmallContent,
    classSmallContent,
    headerTitle,
    smallContent,
    children,
  } = props;

  const HeaderCondition = (params) => {
    const {
      colorBadge,
      withBadgePill,
      headerTitle,
      withBadge,
      badgeTextColor,
    } = params;

    if (withBadge) {
      const color = !Boolean(colorBadge) ? 'tangerin' : colorBadge;
      let textColor = !badgeTextColor ? 'white' : badgeTextColor;
      return (
        <Badge bg={color} pill={withBadgePill ? true : false} text={textColor}>
          {headerTitle}
        </Badge>
      );
    } else {
      return <span>{headerTitle}</span>;
    }
  };

  const SmallContent = (params) => {
    const { classSmallContent, smallContent } = params;
    const classContent = !Boolean(classSmallContent)
      ? 'text-end font-size-14 text-muted'
      : classSmallContent;
    const contentSmall = !Boolean(smallContent)
      ? '2001/04/30 00:01'
      : smallContent;

    return (
      <div className="col-6">
        <h5 className={classContent}>
          <small>{contentSmall}</small>
        </h5>
      </div>
    );
  };

  return (
    <>
      <Row className="justify-content-between">
        <div className={withSmallContent ? 'col-6' : 'col-12'}>
          <h5 className={classHeaderTitle}>
            <HeaderCondition
              colorBadge={colorBadge}
              withBadge={withBadge}
              withBadgePill={withBadgePill}
              headerTitle={headerTitle}
              badgeTextColor={badgeTextColor}
            />
          </h5>
        </div>
        {withSmallContent && (
          <SmallContent
            classSmallContent={classSmallContent}
            smallContent={smallContent}
          />
        )}
      </Row>
      {children}
    </>
  );
}

export default CardList;
