import fileSaver from 'file-saver';
import React, { useEffect, useRef, useState } from 'react';
import { Card, UncontrolledTooltip } from 'reactstrap';
import { limitText, randomString } from '../../utils/helpers';
import FancyApp from '../FancyApp/FancyApp';

const Image = React.memo(
  function ({ src, onError }) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);
    const containerRef = useRef(null);

    // Lazy loading with Intersection Observer - only load when image is near viewport
    useEffect(() => {
      if (!containerRef.current) return;

      // If browser doesn't support Intersection Observer, load immediately
      if (!window.IntersectionObserver) {
        setShouldLoad(true);
        return;
      }

      // Create observer with 200px root margin for early loading (load before user scrolls to it)
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              // Disconnect observer once image should load
              if (observerRef.current && containerRef.current) {
                observerRef.current.unobserve(containerRef.current);
              }
            }
          });
        },
        {
          rootMargin: '200px', // Start loading 200px before image enters viewport
          threshold: 0.01,
        }
      );

      observerRef.current.observe(containerRef.current);

      return () => {
        if (observerRef.current && containerRef.current) {
          observerRef.current.unobserve(containerRef.current);
        }
      };
    }, []);

    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = (e) => {
      setIsLoading(false);
      setHasError(true);
      if (onError) {
        onError(e);
      }
    };

    // Placeholder skeleton while waiting to load
    const renderPlaceholder = () => (
      <div
        style={{
          width: '100%',
          minHeight: '200px',
          maxHeight: '500px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <i className="ri-image-line" style={{ fontSize: '2rem', color: '#ccc', zIndex: 1 }}></i>
      </div>
    );

    return (
      <div
        ref={containerRef}
        style={{ position: 'relative', display: 'inline-block', width: '100%' }}
      >
        {!shouldLoad && !hasError && renderPlaceholder()}

        {isLoading && shouldLoad && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              zIndex: 1,
            }}
          >
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {hasError ? (
          <div
            style={{
              width: '100%',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              color: '#6c757d',
            }}
          >
            <div className="text-center p-3">
              <i className="ri-image-line" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}></i>
              <p className="mb-0 small">Gagal memuat gambar</p>
            </div>
          </div>
        ) : (
          shouldLoad && (
            <img
              ref={imgRef}
              src={src}
              alt="Chat media"
              onLoad={handleLoad}
              onError={handleError}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                maxWidth: '400px',
                height: 'auto',
                maxHeight: '500px',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                display: 'block',
                margin: '0 auto',
                opacity: isLoading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out',
                cursor: 'pointer',
              }}
              className="img-fluid"
            />
          )
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.src === nextProps.src;
  }
);

function MessageFile(props) {
  const { data, extensionFile, categoryFile } = props;
  const configFancyApps = {
    Toolbar: {
      display: ['zoom', 'close'],
      items: {
        zoom: {
          type: 'button',
          class: 'fancybox__button--zoom',
          label: 'TOGGLE_ZOOM',
          html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><circle cx="10" cy="10" r="7"></circle><path d="M16 16 L21 21"></svg>',
          click: function (event) {
            event.preventDefault();

            const panzoom = this.fancybox.getSlide().Panzoom;

            if (panzoom) {
              panzoom.toggleZoom();
            }
          },
        },
        close: {
          type: 'button',
          label: 'CLOSE',
          class: 'fancybox__button--close',
          html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"></path></svg>',
          tabindex: 1,
          click: function (event) {
            event.stopPropagation();
            event.preventDefault();

            this.fancybox.close();
          },
        },
      },
    },
    Image: {
      zoom: true,
    },
  };

  const handlerDownloadFile = async (fileUrl, fileName) => {
    try {
      // If fileUrl is a data URL, download directly
      if (fileUrl.startsWith('data:')) {
        return fileSaver.saveAs(fileUrl, fileName);
      }

      // If fileUrl is an absolute URL (http/https), fetch and download as blob
      if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
        try {
          const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
              'Accept': '*/*',
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
          }

          const blob = await response.blob();

          // Check if response is actually HTML (error page) instead of the file
          if (blob.type === 'text/html' || blob.type.startsWith('text/')) {
            console.error('Server returned HTML instead of file. URL might be incorrect:', fileUrl);
            // Try to open in new tab as fallback
            window.open(fileUrl, '_blank');
            return;
          }

          // Download the blob
          fileSaver.saveAs(blob, fileName);
        } catch (error) {
          console.error('Error downloading file:', error);
          // Fallback: try to open in new tab
          window.open(fileUrl, '_blank');
        }
      } else {
        // Relative URL or other format - try direct download
        return fileSaver.saveAs(fileUrl, fileName);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try to open in new tab
      if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
        window.open(fileUrl, '_blank');
      }
    }
  };

  const Items = (params) => {
    const { data, extensionFile, categoryFile } = params;
    if (categoryFile.name === 'image') {
      return (
        <div
          style={{
            position: 'relative',
            marginBottom: '8px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#f8f9fa',
            padding: '8px',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.01)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <FancyApp options={configFancyApps}>
            <a
              data-fancybox={`image-chat-${randomString(15)}`}
              data-type="image"
              data-preload="true"
              href={data.file_url}
              data-caption={
                !Boolean(data.message) ? '' : limitText(data.message, 0, 100)
              }
              className={`img-parent popup-img d-block text-center ${['svg', 'png'].includes(extensionFile)
                ? 'with-bg-transparent'
                : ''
                }`}
              title="Klik untuk memperbesar gambar"
              style={{
                textDecoration: 'none',
                display: 'block',
              }}
            >
              <Image src={data.file_url} />
            </a>
          </FancyApp>
          {Boolean(data.message) && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#333',
                wordBreak: 'break-word',
              }}
            >
              {data.message}
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlerDownloadFile(data.file_url, data.file_name);
              }}
              className="btn btn-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease-in-out',
              }}
              title="Download gambar"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <i className="ri-download-2-line" style={{ color: '#333', fontSize: '16px' }}></i>
            </button>
          </div>
        </div>
      );
    }

    let iconFile = '';
    if (categoryFile.name === 'video') {
      iconFile = 'fas fa-file-video';
    } else if (categoryFile.name === 'archived') {
      iconFile = 'fa-solid fa-file-zipper';
    } else if (categoryFile.name === 'code') {
      iconFile = 'fas fa-file-code';
    } else {
      switch (extensionFile) {
        case 'crt':
          iconFile = 'fas fa-file-certificate';
          break;
        case 'csr':
          iconFile = 'fas fa-file-certificate';
          break;
        case 'pdf':
          iconFile = 'fas fa-file-pdf';
          break;
        case 'doc':
          iconFile = 'fas fa-file-word';
          break;
        case 'docx':
          iconFile = 'fas fa-file-word';
          break;
        case 'xls':
          iconFile = 'fas fa-file-excel';
          break;
        case 'xlsx':
          iconFile = 'fas fa-file-excel';
          break;
        case 'csv':
          iconFile = 'fas fa-file-csv';
          break;
        default:
          iconFile = 'fas fa-file';
          break;
      }
    }

    // Clean file_id to make it safe for CSS selector (remove invalid characters)
    const cleanFileId = String(data.file_id || '').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const specialId = `fileName-${randomString(10)}-${cleanFileId}`;
    const cardClass = Boolean(data.agent_name)
      ? 'card-file-right'
      : 'card-file-left';
    return (
      <>
        <Card className={`p-2 mb-2 file-text-responsived ${cardClass}`}>
          <div className="d-flex align-items-center">
            <div className="avatar-sm me-3 ms-0">
              <div className="avatar-title card-avatar-file rounded">
                <i className={iconFile}></i>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="text-start">
                <h5
                  className="font-size-14 mb-1 d-inline-block text-truncate text-avatar-header"
                  style={{ cursor: 'help' }}
                  id={specialId}
                >
                  {data.file_name}
                </h5>
                <UncontrolledTooltip target={specialId} placement="top">
                  {data.file_name}
                </UncontrolledTooltip>
                <p className="text-muted-left-file font-size-13 mb-0">
                  {data.file_type === 'other' ? 'document' : data.file_type}
                </p>
              </div>
            </div>

            <div className="ms-4">
              <ul className="list-inline mb-0 font-size-20">
                <li className="list-inline-item">
                  <button
                    type="button"
                    className="btn btn-link text-white text-end p-0"
                    onClick={() => handlerDownloadFile(data.file_url, data.file_name)}
                    style={{ textDecoration: 'none' }}
                    title="Download file"
                  >
                    <i className="ri-download-2-line"></i>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </>
    );
  };

  return (
    <div className="message-img mb-0">
      <div>
        <Items
          data={data}
          extensionFile={extensionFile}
          categoryFile={categoryFile}
        />
      </div>
    </div>
  );
}

export default MessageFile;

// Add shimmer animation for image placeholder
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% {
        left: -100%;
      }
      100% {
        left: 100%;
      }
    }
  `;
  if (!document.head.querySelector('style[data-shimmer]')) {
    style.setAttribute('data-shimmer', 'true');
    document.head.appendChild(style);
  }
}
