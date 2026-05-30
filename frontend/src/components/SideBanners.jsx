import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import '../styles/components/SideBanners.css';

// Shuffle array randomly
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const SideBanners = () => {
  const [ads, setAds] = useState([]);
  const [leftAds, setLeftAds] = useState([]);
  const [rightAds, setRightAds] = useState([]);
  const [adDimensions, setAdDimensions] = useState({});
  const [isCalculated, setIsCalculated] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get('quang-cao');
        if (res.data?.code === 200 && res.data.data?.length > 0) {
          setAds(res.data.data.filter(ad => ad.hinhAnh));
        }
      } catch (err) {
        console.error('Lỗi tải quảng cáo:', err);
      }
    };
    fetchAds();
  }, []);

  // When an ad image loads in the hidden div, record its natural dimensions
  const handleImageLoad = useCallback((adId, e) => {
    const img = e.target;
    const width = img.naturalWidth || 1;
    const height = img.naturalHeight || 1;
    
    setAdDimensions(prev => {
      // Avoid state mutation if dimensions are identical
      const current = prev[adId];
      if (current && current.width === width && current.height === height) {
        return prev;
      }
      return {
        ...prev,
        [adId]: { width, height, ratio: height / width }
      };
    });
  }, []);

  // Once all images loaded, distribute ads to left/right
  useEffect(() => {
    // Only calculate once when all dimensions are ready
    if (ads.length === 0 || isCalculated) return;

    const allLoaded = ads.every(ad => adDimensions[ad.maQuangCao]);
    if (!allLoaded) return;

    // Distribute logic
    const shuffled = shuffleArray(ads);
    const maxHeight = window.innerHeight - 120; // available height
    const isPortrait = (ad) => {
      const dim = adDimensions[ad.maQuangCao];
      return dim && dim.ratio > 1.3; // height > 1.3x width = portrait
    };

    const left = [];
    const right = [];
    let leftHeight = 0;
    let rightHeight = 0;
    const adDisplayWidth = 160;

    for (const ad of shuffled) {
      const dim = adDimensions[ad.maQuangCao];
      if (!dim) continue;
      const displayHeight = adDisplayWidth * dim.ratio;

      if (isPortrait(ad)) {
        if (left.length === 0 || (!left.some(a => isPortrait(a)) && leftHeight + displayHeight <= maxHeight)) {
          if (!left.some(a => isPortrait(a))) {
            left.push(ad);
            leftHeight += displayHeight + 12;
          } else if (!right.some(a => isPortrait(a))) {
            right.push(ad);
            rightHeight += displayHeight + 12;
          }
        } else if (!right.some(a => isPortrait(a)) && rightHeight + displayHeight <= maxHeight) {
          right.push(ad);
          rightHeight += displayHeight + 12;
        }
      } else {
        if (leftHeight <= rightHeight && leftHeight + displayHeight <= maxHeight) {
          left.push(ad);
          leftHeight += displayHeight + 12;
        } else if (rightHeight + displayHeight <= maxHeight) {
          right.push(ad);
          rightHeight += displayHeight + 12;
        }
      }
    }

    setLeftAds(left);
    setRightAds(right);
    setIsCalculated(true);
  }, [ads, adDimensions, isCalculated]);

  if (ads.length === 0) return null;

  const renderAdItem = (ad) => {
    const content = (
      <div className="side-banner-item" key={ad.maQuangCao}>
        <img
          src={ad.hinhAnh}
          alt={ad.tieuDe}
          loading="lazy"
          // Removed onLoad to prevent loops
        />
        <div className="side-banner-label">QC</div>
      </div>
    );

    if (ad.linkRedirect) {
      // Determine if it's an external link
      const isExternal = ad.linkRedirect.startsWith('http://') || ad.linkRedirect.startsWith('https://');
      return (
        <a
          href={ad.linkRedirect}
          key={ad.maQuangCao}
          className="side-banner-link"
          title={ad.tieuDe}
          target={isExternal ? "_blank" : "_self"}
          rel={isExternal ? "noopener noreferrer" : ""}
        >
          {content}
        </a>
      );
    }
    return content;
  };

  return (
    <>
      {/* Hidden preload zone ONLY runs when not calculated yet */}
      {!isCalculated && (
        <div style={{ position: 'absolute', left: -9999, top: -9999, visibility: 'hidden' }}>
          {ads.map(ad => (
            <img
              key={`preload-${ad.maQuangCao}`}
              src={ad.hinhAnh}
              alt=""
              onLoad={(e) => handleImageLoad(ad.maQuangCao, e)}
              onError={(e) => {
                // If error loading, mark as loaded with 1x1 to unblock
                setAdDimensions(prev => ({
                  ...prev,
                  [ad.maQuangCao]: { width: 1, height: 1, ratio: 1 }
                }));
              }}
            />
          ))}
        </div>
      )}

      {leftAds.length > 0 && (
        <div className="side-banners-wrapper side-banners-left">
          <div className="side-banners">
            {leftAds.map(renderAdItem)}
          </div>
        </div>
      )}

      {rightAds.length > 0 && (
        <div className="side-banners-wrapper side-banners-right">
          <div className="side-banners">
            {rightAds.map(renderAdItem)}
          </div>
        </div>
      )}
    </>
  );
};

export default SideBanners;
