import React from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import * as PATH from 'constants/path';
import i18n from 'constants/i18n';
import * as USER_AGENT from 'constants/userAgent';
import ModalContainer from 'renderer/components/Modal/ModalContainer';
import widgetContextMenu from 'main/utils/menu/widgetContextMenu';
import WidgetHeaderContainer from '../../containers/WidgetHeaderContainer';
import EditTab from '../EditTab';
import MakeNotice from '../MakeNotice';
import MenuNewWindow from '../MenuNewWindow';
import ReloadTimer from '../ReloadTimer';
import './WebWidget.scss';

const propTypes = {
  defaultUserAgent: PropTypes.string,
  widget: PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
  }),
  onCancelEditWidget: PropTypes.func,
  onCheckUrlValidation: PropTypes.func,
  onMakeWidget: PropTypes.func,
  onUpdateInfo: PropTypes.func,
};
const defaultProps = {
  defaultUserAgent: 'DESKTOP',
  widget: {},
  onCancelEditWidget() {},
  onCheckUrlValidation() {},
  onMakeWidget() {},
  onUpdateInfo() {},
};

class WebWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUrl: '',
      isLoading: false,
      isSettingOpen: false,
      newWindowURL: null,
    };
    this.webViewRef = React.createRef();
    this.mousePosition = {
      x: 0,
      y: 0,
    };
    this.handleToggleSettingMenu = this.handleToggleSettingMenu.bind(this);
    this.handleToggleNewWindowMenu = this.handleToggleNewWindowMenu.bind(this);
  }

  componentDidMount() {
    const webView = this.webViewRef.current;
    // add event when widget page loading
    webView.addEventListener('did-start-loading', () => {
      this.setState({ isLoading: true });
    });
    webView.addEventListener('did-finish-load', () => {
      this.setState({ isLoading: false });
    });
    webView.addEventListener('did-stop-loading', () => {
      this.setState({ isLoading: false });
    });
    webView.addEventListener('new-window', (e) => {
      this.handleToggleNewWindowMenu(e.url);
    });
    webView.addEventListener('did-navigate', (e) => {
      this.setState({ currentUrl: e.url });
    });
    webView.addEventListener('did-navigate-in-page', (e) => {
      /**
       * when access `google.com`, google redirect `notification.google.com/...` page.
       * So To block It.
       * It will occur isMainFrame === false in params of did-navigate-in-page.
       */
      if (e.isMainFrame) {
        this.setState({ currentUrl: e.url });
      }
    });
    window.addEventListener('contextmenu', () => {
      widgetContextMenu(this.webViewRef.current);
    });

    // webView.addEventListener('dom-ready', () => {
    //   this.webViewRef.current.openDevTools();
    // });

    window.addEventListener('mousemove', (e) => {
      this.mousePosition = {
        x: e.pageX,
        y: e.pageY,
      };
    });
  }

  componentDidUpdate(prevProps) {
    const { currentUrl } = this.state;
    const { defaultUserAgent, widget } = this.props;
    let userAgent;
    if (widget.userAgent) {
      userAgent = widget.userAgent === 'MOBILE' ? USER_AGENT.MOBILE : USER_AGENT.DESKTOP;
    } else {
      userAgent = defaultUserAgent === 'MOBILE' ? USER_AGENT.MOBILE : USER_AGENT.DESKTOP;
    }

    if (prevProps.widget.url !== widget.url) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        currentUrl: widget.url,
      });
      this.webViewRef.current.loadURL(widget.url, { userAgent });
    }

    if (
      (!widget.userAgent && prevProps.defaultUserAgent !== defaultUserAgent) ||
      (prevProps.widget.userAgent !== widget.userAgent)
    ) {
      // Most website provide separate url about userAgent.
      // Mobile page url is prepended with 'm.'.
      // So remove 'm.' in url when change userAgent mobile to desktop.
      this.webViewRef.current.loadURL(
        userAgent === USER_AGENT.DESKTOP ? currentUrl.replace('https://m.', 'https://') : currentUrl,
        { userAgent },
      );
    }
  }

  handleToggleSettingMenu(bool) {
    if (typeof bool === 'boolean') {
      this.setState({ isSettingOpen: bool });
    } else {
      this.setState(prevState => ({ isSettingOpen: !prevState.isSettingOpen }));
    }
  }

  handleToggleNewWindowMenu(targetURL) {
    if (targetURL) {
      this.setState({ newWindowURL: targetURL });
    } else {
      this.setState({ newWindowURL: '' });
    }
  }

  render() {
    const text = i18n().widget;
    const {
      currentUrl,
      isLoading,
      newWindowURL,
    } = this.state;
    const {
      defaultUserAgent,
      widget,
      onCancelEditWidget,
      onCheckUrlValidation,
      onMakeWidget,
      onUpdateInfo,
    } = this.props;

    return (
      <div className="WebWidget">
        <ModalContainer />
        <WidgetHeaderContainer
          currentUrl={currentUrl}
          defaultUserAgent={defaultUserAgent}
          webView={this.webViewRef.current}
          reloadInterval={widget.reloadInterval}
          title={widget.name}
          url={widget.url}
          id={widget.id}
          isMakeProgress={widget.isMakeProgress}
          isLoading={isLoading}
          isOnTop={widget.isOnTop}
          userAgent={widget.userAgent}
          onToggleSetting={this.handleToggleSettingMenu}
        />
        {widget.isEditProgress && (
          <EditTab
            currentUrl={currentUrl}
            id={widget.id}
            name={widget.name}
            title={text.editWidget}
            onCloseTab={() => onCancelEditWidget(widget.id)}
            onCheckUrlValidation={onCheckUrlValidation}
          />
        )}
        {widget.isMakeProgress && (
          <MakeNotice
            currentUrl={currentUrl}
            id={widget.id}
            title={text.addWidget}
            onCheckUrlValidation={onCheckUrlValidation}
          />
        )}
        {newWindowURL && (
          <MenuNewWindow
            url={newWindowURL}
            widget={this.webViewRef.current}
            x={this.mousePosition.x}
            y={this.mousePosition.y}
            onClose={this.handleToggleNewWindowMenu}
            onMakeWidget={onMakeWidget}
          />
        )}
        {widget.reloadInterval ? (
          <ReloadTimer
            id={widget.id}
            webView={this.webViewRef.current}
            reloadTimer={widget.reloadInterval}
            onUpdateInfo={onUpdateInfo}
          />
        ) : null}
        <webview
          ref={this.webViewRef}
          src="https://google.com"
          style={{
            display: 'inline-flex',
            width: '100%',
            height: '100%',
            overflow: 'auto',
            overflowY: 'hidden',
          }}
          preload={url.format({
            pathname: PATH.PRELOAD_SCRIPT_PATH,
            protocol: 'file:',
            slashed: true,
          })}
        />
      </div>
    );
  }
}

WebWidget.propTypes = propTypes;
WebWidget.defaultProps = defaultProps;

export default WebWidget;