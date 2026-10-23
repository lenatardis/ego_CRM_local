import React from "react";
import styles from './FabricSlider.module.scss';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SliderItem from "./SliderItem";

const FabricSlider = ({images, column, products}) => {

    const settings = {
        customPaging: function(i) {
            return (
                <a>
                    <img src={images[i]} alt=""/>
                </a>
            );
        },
        dots: true,
        arrows: false,
        dotsClass: "slick-dots slick-thumb",
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    return (
        <div className={`${styles.fabricSlider} ${column ? styles.columnSlider : ''} ${products ? styles.productPageSlider : ''}`}>
            <Slider {...settings}>
                {
                    images.map((img, index) => (
                        <SliderItem key={index} imgUrl={img} />
                    ))
                }
            </Slider>
        </div>
    )
}

export default FabricSlider;