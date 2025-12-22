import { memo } from "react";
import { Row, Col } from "react-bootstrap";

const SubscriptionCard = memo(({ seriesData, packageData, location, imageBase }) => {
  const getPricingByCurrency = () => {
    if (!packageData || !packageData.packagePricing) {
      return { currency: "PKR", price: "N/A" };
    }

    const targetCurrency = location === "PK" ? "PKR" : "USD";
    const pricing = packageData.packagePricing.find(
      (p) => p.currency === targetCurrency
    );

    return pricing || { currency: "PKR", price: "N/A" };
  };

  return (
    <div className="subscription-card">
      <Row className="subscription-card__row">
        <Col md={6} className="subscription-card__image-col ">
          <div className="subscription-card__image-wrapper" style={{padding:"30px"}}>
            <div className="subscription-card__shimmer" />
            <img
              src={`${imageBase}${seriesData?.imageCoverBig}`}
              onLoad={(e) => {
                e.target.style.opacity = 1;
                e.target.previousSibling.style.display = "none";
              }}
              className="subscription-card__image"
              alt={seriesData?.title || "Series cover"}
            />
          </div>
        </Col>

        <Col md={6} className="subscription-card__content-col" style={{paddingRight:"80px"}}>
          <div className="subscription-card__content">
            <h4 className="subscription-card__title">{seriesData?.title}</h4>
            {packageData?.packagePricing && location && (
              <div className="subscription-card__price">
                {getPricingByCurrency().currency} {getPricingByCurrency().price}
              </div>
            )}
            {packageData?.packageDays && (
              <p className="subscription-card__terms">
                Terms apply: Rentals include {packageData.packageDays} days to start watching this video.
              </p>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
});

SubscriptionCard.displayName = "SubscriptionCard";
export default SubscriptionCard;
