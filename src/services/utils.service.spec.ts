import { UtilsService } from './utils.service';

const threeMatches = `
<table class="generic_kv_table csgo_scoreboard_root">
  <tbody>
    <tr>
      <th class="col_left">Map</th>
      <th>Match Results</th>
    </tr>
    <tr class="parsed">
      <td class="val_left">
        <img
          src="https://steamuserimages-a.akamaihd.net/ugc/249214229971367608/9DDA1E2B3A4A390A673CD68914E1B2B009AC6B42/200x112.resizedimage"
          width="200"
          height="112"
          border="0"
        />
        <table class="csgo_scoreboard_inner_left">
          <tbody>
            <tr>
              <td>Premier Inferno</td>
            </tr>
            <tr>
              <td>2024-02-11 12:58:15 GMT</td>
            </tr>
            <tr>
              <td>Ranked: Yes</td>
            </tr>
            <tr>
              <td>Wait Time: 00:10</td>
            </tr>
            <tr>
              <td>Match Duration: 27:23</td>
            </tr>
            <tr>
              <td class="csgo_scoreboard_cell_noborder">
                <a
                  target="_blank"
                  href="http://replay377.valve.net/730/003667167777405272101_0705903831.dem.bz2"
                >
                  <div
                    class="btnv6_blue_hoverfade btn_medium csgo_scoreboard_btn_gotv"
                  >
                    Download Replay
                  </div>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
      <td>
        <table class="csgo_scoreboard_inner_right">
          <tbody>
            <tr>
              <th class="inner_name">Player Name</th>
              <th>Ping</th>
              <th>K</th>
              <th>A</th>
              <th>D</th>
              <th>★</th>
              <th>HSP</th>
              <th>Score</th>
              <th>Ban status</th>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/Matrix33"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/3224d1766d0fe045d76f5a408732de3fe29939eb.jpg"
                      alt=""
                      data-miniprofile="71794731"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/Matrix33"
                    data-miniprofile="71794731"
                    >Poney</a
                  >
                </div>
              </td>
              <td>23</td>
              <td>19</td>
              <td>1</td>
              <td>6</td>
              <td>★4</td>
              <td>63%</td>
              <td>41</td>
              <td
                data-steamid64="76561198032060459"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/profiles/76561198145844250"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/ebbd00b3b69a6dd37b009f42287b7e7be1ab6c2d.jpg"
                      alt=""
                      data-miniprofile="185578522"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198145844250"
                    data-miniprofile="185578522"
                    >nOOTi</a
                  >
                </div>
              </td>
              <td>12</td>
              <td>16</td>
              <td>4</td>
              <td>9</td>
              <td>★3</td>
              <td>56%</td>
              <td>38</td>
              <td
                data-steamid64="76561198145844250"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar in-game">
                  <a
                    href="https://steamcommunity.com/profiles/76561198041886680"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/f85105fc6707759e4b220f869e5616162a329b3b.jpg"
                      alt=""
                      data-miniprofile="81620952"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198041886680"
                    data-miniprofile="81620952"
                    >Black Eyes</a
                  >
                </div>
              </td>
              <td>53</td>
              <td>14</td>
              <td>6</td>
              <td>10</td>
              <td>★4</td>
              <td>21%</td>
              <td>34</td>
              <td
                data-steamid64="76561198041886680"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a href="https://steamcommunity.com/id/stak_"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/80158837a361e613305c01b37ac4243e457ed9e6.jpg"
                      alt=""
                      data-miniprofile="1932672"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/stak_"
                    data-miniprofile="1932672"
                    >staK</a
                  >
                </div>
              </td>
              <td>25</td>
              <td>12</td>
              <td>2</td>
              <td>9</td>
              <td>★2</td>
              <td>33%</td>
              <td>30</td>
              <td
                data-steamid64="76561197962198400"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar in-game">
                  <a href="https://steamcommunity.com/id/BlondVador"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/f414df47b941b2e4e515d70e00949edb0408747b.jpg"
                      alt=""
                      data-miniprofile="25001823"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/BlondVador"
                    data-miniprofile="25001823"
                    >Ambroise Croizat L2P</a
                  >
                </div>
              </td>
              <td>21</td>
              <td>7</td>
              <td>6</td>
              <td>8</td>
              <td>&nbsp;</td>
              <td>42%</td>
              <td>20</td>
              <td
                data-steamid64="76561197985267551"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td colspan="9" class="csgo_scoreboard_score">13 : 4</td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198271309750"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/a0529fe749b517bb4c929d5d9553a65799c5fab2.jpg"
                      alt=""
                      data-miniprofile="311044022"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198271309750"
                    data-miniprofile="311044022"
                    >MATKO JAK ZIMNO</a
                  >
                </div>
              </td>
              <td>34</td>
              <td>10</td>
              <td>4</td>
              <td>13</td>
              <td>★</td>
              <td>40%</td>
              <td>24</td>
              <td
                data-steamid64="76561198271309750"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198038197916"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/7bba181dccca177f20d74843ad75a8c0dae0ee79.jpg"
                      alt=""
                      data-miniprofile="77932188"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198038197916"
                    data-miniprofile="77932188"
                    >DeSErT^♛</a
                  >
                </div>
              </td>
              <td>16</td>
              <td>9</td>
              <td>4</td>
              <td>14</td>
              <td>&nbsp;</td>
              <td>66%</td>
              <td>22</td>
              <td
                data-steamid64="76561198038197916"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a href="https://steamcommunity.com/id/get_1"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/c33902638a365e3201d265f946556276fd436d90.jpg"
                      alt=""
                      data-miniprofile="676993"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/get_1"
                    data-miniprofile="676993"
                    >Get</a
                  >
                </div>
              </td>
              <td>22</td>
              <td>7</td>
              <td>4</td>
              <td>14</td>
              <td>★</td>
              <td>85%</td>
              <td>20</td>
              <td
                data-steamid64="76561197960942721"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561197968956924"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/1944fc7616d99f7e9d11e3750adfc94a2b02e621.jpg"
                      alt=""
                      data-miniprofile="8691196"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561197968956924"
                    data-miniprofile="8691196"
                    >oPa gerHard</a
                  >
                </div>
              </td>
              <td>21</td>
              <td>8</td>
              <td>2</td>
              <td>15</td>
              <td>★</td>
              <td>37%</td>
              <td>19</td>
              <td
                data-steamid64="76561197968956924"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/Keppysssss"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/97ab17708e7922fbf588bf1a6a6698b2542a6377.jpg"
                      alt=""
                      data-miniprofile="170526543"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/Keppysssss"
                    data-miniprofile="170526543"
                    >pRIME'유 ...</a
                  >
                </div>
              </td>
              <td>16</td>
              <td>8</td>
              <td>0</td>
              <td>13</td>
              <td>★</td>
              <td>87%</td>
              <td>18</td>
              <td
                data-steamid64="76561198130792271"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
    </tr>

    <tr style="display: table-row" class="parsed">
      <td class="val_left">
        <img
          src="https://steamuserimages-a.akamaihd.net/ugc/882984447753219894/D947D4FA6CC0CA4D3DE8D67D8B40A3EFC462EE19/200x112.resizedimage"
          width="200"
          height="112"
          border="0"
        />
        <table class="csgo_scoreboard_inner_left">
          <tbody>
            <tr>
              <td>Premier Mirage</td>
            </tr>
            <tr>
              <td>2024-01-20 16:03:07 GMT</td>
            </tr>
            <tr>
              <td>Ranked: Yes</td>
            </tr>
            <tr>
              <td>Wait Time: 00:20</td>
            </tr>
            <tr>
              <td>Match Duration: 42:07</td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
      <td>
        <table class="csgo_scoreboard_inner_right">
          <tbody>
            <tr>
              <th class="inner_name">Player Name</th>
              <th>Ping</th>
              <th>K</th>
              <th>A</th>
              <th>D</th>
              <th>★</th>
              <th>HSP</th>
              <th>Score</th>
              <th>Ban status</th>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a href="https://steamcommunity.com/id/stak_"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/80158837a361e613305c01b37ac4243e457ed9e6.jpg"
                      alt=""
                      data-miniprofile="1932672"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/stak_"
                    data-miniprofile="1932672"
                    >staK</a
                  >
                </div>
              </td>
              <td>19</td>
              <td>23</td>
              <td>6</td>
              <td>14</td>
              <td>★3</td>
              <td>30%</td>
              <td>58</td>
              <td
                data-steamid64="76561197962198400"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar in-game">
                  <a
                    href="https://steamcommunity.com/profiles/76561198982648815"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/4ebb9a73cb240932cdfe8e5f5fd35a222b298c51.jpg"
                      alt=""
                      data-miniprofile="1022383087"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198982648815"
                    data-miniprofile="1022383087"
                    >kaser</a
                  >
                </div>
              </td>
              <td>0</td>
              <td>20</td>
              <td>4</td>
              <td>18</td>
              <td>★3</td>
              <td>30%</td>
              <td>46</td>
              <td
                data-steamid64="76561198982648815"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/profiles/76561198135483009"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/454315118a60c2fc2ab1712458560366430500aa.jpg"
                      alt=""
                      data-miniprofile="175217281"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198135483009"
                    data-miniprofile="175217281"
                    >StoeV</a
                  >
                </div>
              </td>
              <td>0</td>
              <td>17</td>
              <td>3</td>
              <td>16</td>
              <td>★2</td>
              <td>29%</td>
              <td>45</td>
              <td
                data-steamid64="76561198135483009"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/profiles/76561198084071767"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/126ed2cb3b405f4c61b6e25a1ad73dc5ba47a015.jpg"
                      alt=""
                      data-miniprofile="123806039"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198084071767"
                    data-miniprofile="123806039"
                    >denkataLUD</a
                  >
                </div>
              </td>
              <td>36</td>
              <td>15</td>
              <td>6</td>
              <td>18</td>
              <td>★</td>
              <td>46%</td>
              <td>37</td>
              <td
                data-steamid64="76561198084071767"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198213074969"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/d99bcb822508ce06f1b39e045e1e4d2cac5f963c.jpg"
                      alt=""
                      data-miniprofile="252809241"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198213074969"
                    data-miniprofile="252809241"
                    >toplo mi e</a
                  >
                </div>
              </td>
              <td>36</td>
              <td>9</td>
              <td>5</td>
              <td>20</td>
              <td>★</td>
              <td>66%</td>
              <td>25</td>
              <td
                data-steamid64="76561198213074969"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td colspan="9" class="csgo_scoreboard_score">10 : 13</td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198237798164"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/d411ec108ab7f7b34ad8dab8129ca1abcdff4387.jpg"
                      alt=""
                      data-miniprofile="277532436"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198237798164"
                    data-miniprofile="277532436"
                    >Mazzleyh</a
                  >
                </div>
              </td>
              <td>8</td>
              <td>20</td>
              <td>4</td>
              <td>15</td>
              <td>★3</td>
              <td>15%</td>
              <td>55</td>
              <td
                data-steamid64="76561198237798164"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/profiles/76561198363022316"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/359c06c6f09c548c136cb08b39edbe10e979e6af.jpg"
                      alt=""
                      data-miniprofile="402756588"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198363022316"
                    data-miniprofile="402756588"
                    >CA-Click</a
                  >
                </div>
              </td>
              <td>8</td>
              <td>21</td>
              <td>4</td>
              <td>16</td>
              <td>★3</td>
              <td>38%</td>
              <td>52</td>
              <td
                data-steamid64="76561198363022316"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/profiles/76561198037365307"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/a67cc32df75a6ae656a565152c1d2a731564c274.jpg"
                      alt=""
                      data-miniprofile="77099579"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198037365307"
                    data-miniprofile="77099579"
                    >The Game ♿</a
                  >
                </div>
              </td>
              <td>31</td>
              <td>15</td>
              <td>8</td>
              <td>18</td>
              <td>★2</td>
              <td>53%</td>
              <td>46</td>
              <td
                data-steamid64="76561198037365307"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/MainOfTheTop"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/c7a849e6314d656af3dbb5a47534d18b103116e5.jpg"
                      alt=""
                      data-miniprofile="1565552243"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/MainOfTheTop"
                    data-miniprofile="1565552243"
                    >Cratex</a
                  >
                </div>
              </td>
              <td>40</td>
              <td>17</td>
              <td>7</td>
              <td>18</td>
              <td>★3</td>
              <td>29%</td>
              <td>39</td>
              <td
                data-steamid64="76561199525817971"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198114928149"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/5148a55760243e34676cfeee99491577462a7fa8.jpg"
                      alt=""
                      data-miniprofile="154662421"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198114928149"
                    data-miniprofile="154662421"
                    >KlayPeX</a
                  >
                </div>
              </td>
              <td>29</td>
              <td>13</td>
              <td>6</td>
              <td>20</td>
              <td>★2</td>
              <td>30%</td>
              <td>37</td>
              <td
                data-steamid64="76561198114928149"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
    </tr>
    <tr style="display: table-row" class="parsed">
      <td class="val_left">
        <img
          src="https://steamuserimages-a.akamaihd.net/ugc/882984447753219894/D947D4FA6CC0CA4D3DE8D67D8B40A3EFC462EE19/200x112.resizedimage"
          width="200"
          height="112"
          border="0"
        />
        <table class="csgo_scoreboard_inner_left">
          <tbody>
            <tr>
              <td>Premier Mirage</td>
            </tr>
            <tr>
              <td>2024-01-18 20:43:04 GMT</td>
            </tr>
            <tr>
              <td>Ranked: Yes</td>
            </tr>
            <tr>
              <td>Wait Time: 00:24</td>
            </tr>
            <tr>
              <td>Match Duration: 33:49</td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
      <td>
        <table class="csgo_scoreboard_inner_right">
          <tbody>
            <tr>
              <th class="inner_name">Player Name</th>
              <th>Ping</th>
              <th>K</th>
              <th>A</th>
              <th>D</th>
              <th>★</th>
              <th>HSP</th>
              <th>Score</th>
              <th>Ban status</th>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198847282908"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/543d3d0e34cbd345c487b7cf213cd58c6740a08c.jpg"
                      alt=""
                      data-miniprofile="887017180"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198847282908"
                    data-miniprofile="887017180"
                    >Barry</a
                  >
                </div>
              </td>
              <td>20</td>
              <td>28</td>
              <td>3</td>
              <td>15</td>
              <td>★5</td>
              <td>50%</td>
              <td>60</td>
              <td
                data-steamid64="76561198847282908"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a href="https://steamcommunity.com/id/stak_"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/80158837a361e613305c01b37ac4243e457ed9e6.jpg"
                      alt=""
                      data-miniprofile="1932672"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/stak_"
                    data-miniprofile="1932672"
                    >staK</a
                  >
                </div>
              </td>
              <td>33</td>
              <td>15</td>
              <td>7</td>
              <td>16</td>
              <td>★3</td>
              <td>46%</td>
              <td>44</td>
              <td
                data-steamid64="76561197962198400"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561199038809279"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/39747c4d0019393137da4d9e78d066f1aab9364e.jpg"
                      alt=""
                      data-miniprofile="1078543551"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561199038809279"
                    data-miniprofile="1078543551"
                    >wluffy</a
                  >
                </div>
              </td>
              <td>51</td>
              <td>16</td>
              <td>2</td>
              <td>18</td>
              <td>&nbsp;</td>
              <td>37%</td>
              <td>34</td>
              <td
                data-steamid64="76561199038809279"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar in-game">
                  <a href="https://steamcommunity.com/id/PAZZYSPROFILE"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/2e5fa726fc7b4d150ef395bb6d2d27d288f7b223.jpg"
                      alt=""
                      data-miniprofile="1508824073"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/PAZZYSPROFILE"
                    data-miniprofile="1508824073"
                    >LIQUID P A Z Z Y</a
                  >
                </div>
              </td>
              <td>45</td>
              <td>10</td>
              <td>5</td>
              <td>19</td>
              <td>★</td>
              <td>70%</td>
              <td>31</td>
              <td
                data-steamid64="76561199469089801"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198260870706"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/ca79bc459881ac3b9bc147e4cb2896ee344141ed.jpg"
                      alt=""
                      data-miniprofile="300604978"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198260870706"
                    data-miniprofile="300604978"
                    >Pau</a
                  >
                </div>
              </td>
              <td>51</td>
              <td>10</td>
              <td>6</td>
              <td>15</td>
              <td>&nbsp;</td>
              <td>50%</td>
              <td>30</td>
              <td
                data-steamid64="76561198260870706"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td colspan="9" class="csgo_scoreboard_score">9 : 13</td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/id/SomeRandomGuyOnTheInternet"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/fb2aba9fa858e9f31cb6049eba2d29307f2a20a1.jpg"
                      alt=""
                      data-miniprofile="222242102"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/SomeRandomGuyOnTheInternet"
                    data-miniprofile="222242102"
                    >SuuSh</a
                  >
                </div>
              </td>
              <td>17</td>
              <td>25</td>
              <td>11</td>
              <td>18</td>
              <td>★5</td>
              <td>60%</td>
              <td>63</td>
              <td
                data-steamid64="76561198182507830"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/chizzarra"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/18d906293a276bc10249bc316ed653b7a5c8a132.jpg"
                      alt=""
                      data-miniprofile="307466724"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/chizzarra"
                    data-miniprofile="307466724"
                    >lamo</a
                  >
                </div>
              </td>
              <td>13</td>
              <td>18</td>
              <td>3</td>
              <td>13</td>
              <td>★5</td>
              <td>33%</td>
              <td>57</td>
              <td
                data-steamid64="76561198267732452"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/profiles/76561198876861073"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/f9e7e02b28bf8f1f18c07a5e95cb714b795195fd.jpg"
                      alt=""
                      data-miniprofile="916595345"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198876861073"
                    data-miniprofile="916595345"
                    >ЗРАДНИК</a
                  >
                </div>
              </td>
              <td>14</td>
              <td>20</td>
              <td>5</td>
              <td>14</td>
              <td>★2</td>
              <td>40%</td>
              <td>52</td>
              <td
                data-steamid64="76561198876861073"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/HardyOff"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/1191c81a57194f64acfcda94f0fd0cb94e92eff7.jpg"
                      alt=""
                      data-miniprofile="969189673"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/HardyOff"
                    data-miniprofile="969189673"
                    >Diamond</a
                  >
                </div>
              </td>
              <td>19</td>
              <td>14</td>
              <td>4</td>
              <td>16</td>
              <td>★</td>
              <td>42%</td>
              <td>34</td>
              <td
                data-steamid64="76561198929455401"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561199106360073"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/ce8e4f7a5e5169b4b81e55a34002b6083b134841.jpg"
                      alt=""
                      data-miniprofile="1146094345"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561199106360073"
                    data-miniprofile="1146094345"
                    >Sta1ns</a
                  >
                </div>
              </td>
              <td>5</td>
              <td>5</td>
              <td>3</td>
              <td>18</td>
              <td>&nbsp;</td>
              <td>60%</td>
              <td>13</td>
              <td
                data-steamid64="76561199106360073"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
    </tr>
  </tbody>
</table>
`;
const twoMatches = `
<table class="generic_kv_table csgo_scoreboard_root">
  <tbody>
    <tr>
      <th class="col_left">Map</th>
      <th>Match Results</th>
    </tr>
    <tr class="parsed">
      <td class="val_left">
        <img
          src="https://steamuserimages-a.akamaihd.net/ugc/249214229971367608/9DDA1E2B3A4A390A673CD68914E1B2B009AC6B42/200x112.resizedimage"
          width="200"
          height="112"
          border="0"
        />
        <table class="csgo_scoreboard_inner_left">
          <tbody>
            <tr>
              <td>Premier Inferno</td>
            </tr>
            <tr>
              <td>2024-02-11 12:58:15 GMT</td>
            </tr>
            <tr>
              <td>Ranked: Yes</td>
            </tr>
            <tr>
              <td>Wait Time: 00:10</td>
            </tr>
            <tr>
              <td>Match Duration: 27:23</td>
            </tr>
            <tr>
              <td class="csgo_scoreboard_cell_noborder">
                <a
                  target="_blank"
                  href="http://replay377.valve.net/730/003667167777405272101_0705903831.dem.bz2"
                >
                  <div
                    class="btnv6_blue_hoverfade btn_medium csgo_scoreboard_btn_gotv"
                  >
                    Download Replay
                  </div>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
      <td>
        <table class="csgo_scoreboard_inner_right">
          <tbody>
            <tr>
              <th class="inner_name">Player Name</th>
              <th>Ping</th>
              <th>K</th>
              <th>A</th>
              <th>D</th>
              <th>★</th>
              <th>HSP</th>
              <th>Score</th>
              <th>Ban status</th>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/Matrix33"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/3224d1766d0fe045d76f5a408732de3fe29939eb.jpg"
                      alt=""
                      data-miniprofile="71794731"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/Matrix33"
                    data-miniprofile="71794731"
                    >Poney</a
                  >
                </div>
              </td>
              <td>23</td>
              <td>19</td>
              <td>1</td>
              <td>6</td>
              <td>★4</td>
              <td>63%</td>
              <td>41</td>
              <td
                data-steamid64="76561198032060459"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/profiles/76561198145844250"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/ebbd00b3b69a6dd37b009f42287b7e7be1ab6c2d.jpg"
                      alt=""
                      data-miniprofile="185578522"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198145844250"
                    data-miniprofile="185578522"
                    >nOOTi</a
                  >
                </div>
              </td>
              <td>12</td>
              <td>16</td>
              <td>4</td>
              <td>9</td>
              <td>★3</td>
              <td>56%</td>
              <td>38</td>
              <td
                data-steamid64="76561198145844250"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar in-game">
                  <a
                    href="https://steamcommunity.com/profiles/76561198041886680"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/f85105fc6707759e4b220f869e5616162a329b3b.jpg"
                      alt=""
                      data-miniprofile="81620952"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198041886680"
                    data-miniprofile="81620952"
                    >Black Eyes</a
                  >
                </div>
              </td>
              <td>53</td>
              <td>14</td>
              <td>6</td>
              <td>10</td>
              <td>★4</td>
              <td>21%</td>
              <td>34</td>
              <td
                data-steamid64="76561198041886680"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a href="https://steamcommunity.com/id/stak_"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/80158837a361e613305c01b37ac4243e457ed9e6.jpg"
                      alt=""
                      data-miniprofile="1932672"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/stak_"
                    data-miniprofile="1932672"
                    >staK</a
                  >
                </div>
              </td>
              <td>25</td>
              <td>12</td>
              <td>2</td>
              <td>9</td>
              <td>★2</td>
              <td>33%</td>
              <td>30</td>
              <td
                data-steamid64="76561197962198400"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar in-game">
                  <a href="https://steamcommunity.com/id/BlondVador"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/f414df47b941b2e4e515d70e00949edb0408747b.jpg"
                      alt=""
                      data-miniprofile="25001823"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/BlondVador"
                    data-miniprofile="25001823"
                    >Ambroise Croizat L2P</a
                  >
                </div>
              </td>
              <td>21</td>
              <td>7</td>
              <td>6</td>
              <td>8</td>
              <td>&nbsp;</td>
              <td>42%</td>
              <td>20</td>
              <td
                data-steamid64="76561197985267551"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td colspan="9" class="csgo_scoreboard_score">13 : 4</td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198271309750"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/a0529fe749b517bb4c929d5d9553a65799c5fab2.jpg"
                      alt=""
                      data-miniprofile="311044022"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198271309750"
                    data-miniprofile="311044022"
                    >MATKO JAK ZIMNO</a
                  >
                </div>
              </td>
              <td>34</td>
              <td>10</td>
              <td>4</td>
              <td>13</td>
              <td>★</td>
              <td>40%</td>
              <td>24</td>
              <td
                data-steamid64="76561198271309750"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198038197916"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/7bba181dccca177f20d74843ad75a8c0dae0ee79.jpg"
                      alt=""
                      data-miniprofile="77932188"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198038197916"
                    data-miniprofile="77932188"
                    >DeSErT^♛</a
                  >
                </div>
              </td>
              <td>16</td>
              <td>9</td>
              <td>4</td>
              <td>14</td>
              <td>&nbsp;</td>
              <td>66%</td>
              <td>22</td>
              <td
                data-steamid64="76561198038197916"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a href="https://steamcommunity.com/id/get_1"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/c33902638a365e3201d265f946556276fd436d90.jpg"
                      alt=""
                      data-miniprofile="676993"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/get_1"
                    data-miniprofile="676993"
                    >Get</a
                  >
                </div>
              </td>
              <td>22</td>
              <td>7</td>
              <td>4</td>
              <td>14</td>
              <td>★</td>
              <td>85%</td>
              <td>20</td>
              <td
                data-steamid64="76561197960942721"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561197968956924"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/1944fc7616d99f7e9d11e3750adfc94a2b02e621.jpg"
                      alt=""
                      data-miniprofile="8691196"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561197968956924"
                    data-miniprofile="8691196"
                    >oPa gerHard</a
                  >
                </div>
              </td>
              <td>21</td>
              <td>8</td>
              <td>2</td>
              <td>15</td>
              <td>★</td>
              <td>37%</td>
              <td>19</td>
              <td
                data-steamid64="76561197968956924"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/Keppysssss"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/97ab17708e7922fbf588bf1a6a6698b2542a6377.jpg"
                      alt=""
                      data-miniprofile="170526543"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/Keppysssss"
                    data-miniprofile="170526543"
                    >pRIME'유 ...</a
                  >
                </div>
              </td>
              <td>16</td>
              <td>8</td>
              <td>0</td>
              <td>13</td>
              <td>★</td>
              <td>87%</td>
              <td>18</td>
              <td
                data-steamid64="76561198130792271"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
    </tr>

    <tr style="display: table-row" class="parsed">
      <td class="val_left">
        <img
          src="https://steamuserimages-a.akamaihd.net/ugc/882984447753219894/D947D4FA6CC0CA4D3DE8D67D8B40A3EFC462EE19/200x112.resizedimage"
          width="200"
          height="112"
          border="0"
        />
        <table class="csgo_scoreboard_inner_left">
          <tbody>
            <tr>
              <td>Premier Mirage</td>
            </tr>
            <tr>
              <td>2024-01-18 20:43:04 GMT</td>
            </tr>
            <tr>
              <td>Ranked: Yes</td>
            </tr>
            <tr>
              <td>Wait Time: 00:24</td>
            </tr>
            <tr>
              <td>Match Duration: 33:49</td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
      <td>
        <table class="csgo_scoreboard_inner_right">
          <tbody>
            <tr>
              <th class="inner_name">Player Name</th>
              <th>Ping</th>
              <th>K</th>
              <th>A</th>
              <th>D</th>
              <th>★</th>
              <th>HSP</th>
              <th>Score</th>
              <th>Ban status</th>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198847282908"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/543d3d0e34cbd345c487b7cf213cd58c6740a08c.jpg"
                      alt=""
                      data-miniprofile="887017180"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198847282908"
                    data-miniprofile="887017180"
                    >Barry</a
                  >
                </div>
              </td>
              <td>20</td>
              <td>28</td>
              <td>3</td>
              <td>15</td>
              <td>★5</td>
              <td>50%</td>
              <td>60</td>
              <td
                data-steamid64="76561198847282908"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a href="https://steamcommunity.com/id/stak_"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/80158837a361e613305c01b37ac4243e457ed9e6.jpg"
                      alt=""
                      data-miniprofile="1932672"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/stak_"
                    data-miniprofile="1932672"
                    >staK</a
                  >
                </div>
              </td>
              <td>33</td>
              <td>15</td>
              <td>7</td>
              <td>16</td>
              <td>★3</td>
              <td>46%</td>
              <td>44</td>
              <td
                data-steamid64="76561197962198400"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561199038809279"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/39747c4d0019393137da4d9e78d066f1aab9364e.jpg"
                      alt=""
                      data-miniprofile="1078543551"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561199038809279"
                    data-miniprofile="1078543551"
                    >wluffy</a
                  >
                </div>
              </td>
              <td>51</td>
              <td>16</td>
              <td>2</td>
              <td>18</td>
              <td>&nbsp;</td>
              <td>37%</td>
              <td>34</td>
              <td
                data-steamid64="76561199038809279"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar in-game">
                  <a href="https://steamcommunity.com/id/PAZZYSPROFILE"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/2e5fa726fc7b4d150ef395bb6d2d27d288f7b223.jpg"
                      alt=""
                      data-miniprofile="1508824073"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/PAZZYSPROFILE"
                    data-miniprofile="1508824073"
                    >LIQUID P A Z Z Y</a
                  >
                </div>
              </td>
              <td>45</td>
              <td>10</td>
              <td>5</td>
              <td>19</td>
              <td>★</td>
              <td>70%</td>
              <td>31</td>
              <td
                data-steamid64="76561199469089801"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198260870706"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/ca79bc459881ac3b9bc147e4cb2896ee344141ed.jpg"
                      alt=""
                      data-miniprofile="300604978"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198260870706"
                    data-miniprofile="300604978"
                    >Pau</a
                  >
                </div>
              </td>
              <td>51</td>
              <td>10</td>
              <td>6</td>
              <td>15</td>
              <td>&nbsp;</td>
              <td>50%</td>
              <td>30</td>
              <td
                data-steamid64="76561198260870706"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td colspan="9" class="csgo_scoreboard_score">9 : 13</td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/id/SomeRandomGuyOnTheInternet"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/fb2aba9fa858e9f31cb6049eba2d29307f2a20a1.jpg"
                      alt=""
                      data-miniprofile="222242102"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/SomeRandomGuyOnTheInternet"
                    data-miniprofile="222242102"
                    >SuuSh</a
                  >
                </div>
              </td>
              <td>17</td>
              <td>25</td>
              <td>11</td>
              <td>18</td>
              <td>★5</td>
              <td>60%</td>
              <td>63</td>
              <td
                data-steamid64="76561198182507830"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/chizzarra"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/18d906293a276bc10249bc316ed653b7a5c8a132.jpg"
                      alt=""
                      data-miniprofile="307466724"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/chizzarra"
                    data-miniprofile="307466724"
                    >lamo</a
                  >
                </div>
              </td>
              <td>13</td>
              <td>18</td>
              <td>3</td>
              <td>13</td>
              <td>★5</td>
              <td>33%</td>
              <td>57</td>
              <td
                data-steamid64="76561198267732452"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/profiles/76561198876861073"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/f9e7e02b28bf8f1f18c07a5e95cb714b795195fd.jpg"
                      alt=""
                      data-miniprofile="916595345"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198876861073"
                    data-miniprofile="916595345"
                    >ЗРАДНИК</a
                  >
                </div>
              </td>
              <td>14</td>
              <td>20</td>
              <td>5</td>
              <td>14</td>
              <td>★2</td>
              <td>40%</td>
              <td>52</td>
              <td
                data-steamid64="76561198876861073"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/HardyOff"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/1191c81a57194f64acfcda94f0fd0cb94e92eff7.jpg"
                      alt=""
                      data-miniprofile="969189673"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/HardyOff"
                    data-miniprofile="969189673"
                    >Diamond</a
                  >
                </div>
              </td>
              <td>19</td>
              <td>14</td>
              <td>4</td>
              <td>16</td>
              <td>★</td>
              <td>42%</td>
              <td>34</td>
              <td
                data-steamid64="76561198929455401"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561199106360073"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/ce8e4f7a5e5169b4b81e55a34002b6083b134841.jpg"
                      alt=""
                      data-miniprofile="1146094345"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561199106360073"
                    data-miniprofile="1146094345"
                    >Sta1ns</a
                  >
                </div>
              </td>
              <td>5</td>
              <td>5</td>
              <td>3</td>
              <td>18</td>
              <td>&nbsp;</td>
              <td>60%</td>
              <td>13</td>
              <td
                data-steamid64="76561199106360073"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
    </tr>
  </tbody>
</table>
`;
const oneMatch = `
<table class="generic_kv_table csgo_scoreboard_root">
  <tbody>
    <tr>
      <th class="col_left">Map</th>
      <th>Match Results</th>
    </tr>

    <tr style="display: table-row" class="parsed">
      <td class="val_left">
        <img
          src="https://steamuserimages-a.akamaihd.net/ugc/882984447753219894/D947D4FA6CC0CA4D3DE8D67D8B40A3EFC462EE19/200x112.resizedimage"
          width="200"
          height="112"
          border="0"
        />
        <table class="csgo_scoreboard_inner_left">
          <tbody>
            <tr>
              <td>Premier Mirage</td>
            </tr>
            <tr>
              <td>2024-01-18 20:43:04 GMT</td>
            </tr>
            <tr>
              <td>Ranked: Yes</td>
            </tr>
            <tr>
              <td>Wait Time: 00:24</td>
            </tr>
            <tr>
              <td>Match Duration: 33:49</td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
      <td>
        <table class="csgo_scoreboard_inner_right">
          <tbody>
            <tr>
              <th class="inner_name">Player Name</th>
              <th>Ping</th>
              <th>K</th>
              <th>A</th>
              <th>D</th>
              <th>★</th>
              <th>HSP</th>
              <th>Score</th>
              <th>Ban status</th>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198847282908"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/543d3d0e34cbd345c487b7cf213cd58c6740a08c.jpg"
                      alt=""
                      data-miniprofile="887017180"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198847282908"
                    data-miniprofile="887017180"
                    >Barry</a
                  >
                </div>
              </td>
              <td>20</td>
              <td>28</td>
              <td>3</td>
              <td>15</td>
              <td>★5</td>
              <td>50%</td>
              <td>60</td>
              <td
                data-steamid64="76561198847282908"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a href="https://steamcommunity.com/id/stak_"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/80158837a361e613305c01b37ac4243e457ed9e6.jpg"
                      alt=""
                      data-miniprofile="1932672"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/stak_"
                    data-miniprofile="1932672"
                    >staK</a
                  >
                </div>
              </td>
              <td>33</td>
              <td>15</td>
              <td>7</td>
              <td>16</td>
              <td>★3</td>
              <td>46%</td>
              <td>44</td>
              <td
                data-steamid64="76561197962198400"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561199038809279"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/39747c4d0019393137da4d9e78d066f1aab9364e.jpg"
                      alt=""
                      data-miniprofile="1078543551"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561199038809279"
                    data-miniprofile="1078543551"
                    >wluffy</a
                  >
                </div>
              </td>
              <td>51</td>
              <td>16</td>
              <td>2</td>
              <td>18</td>
              <td>&nbsp;</td>
              <td>37%</td>
              <td>34</td>
              <td
                data-steamid64="76561199038809279"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar in-game">
                  <a href="https://steamcommunity.com/id/PAZZYSPROFILE"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/2e5fa726fc7b4d150ef395bb6d2d27d288f7b223.jpg"
                      alt=""
                      data-miniprofile="1508824073"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/PAZZYSPROFILE"
                    data-miniprofile="1508824073"
                    >LIQUID P A Z Z Y</a
                  >
                </div>
              </td>
              <td>45</td>
              <td>10</td>
              <td>5</td>
              <td>19</td>
              <td>★</td>
              <td>70%</td>
              <td>31</td>
              <td
                data-steamid64="76561199469089801"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561198260870706"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/ca79bc459881ac3b9bc147e4cb2896ee344141ed.jpg"
                      alt=""
                      data-miniprofile="300604978"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198260870706"
                    data-miniprofile="300604978"
                    >Pau</a
                  >
                </div>
              </td>
              <td>51</td>
              <td>10</td>
              <td>6</td>
              <td>15</td>
              <td>&nbsp;</td>
              <td>50%</td>
              <td>30</td>
              <td
                data-steamid64="76561198260870706"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td colspan="9" class="csgo_scoreboard_score">9 : 13</td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/id/SomeRandomGuyOnTheInternet"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/fb2aba9fa858e9f31cb6049eba2d29307f2a20a1.jpg"
                      alt=""
                      data-miniprofile="222242102"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/SomeRandomGuyOnTheInternet"
                    data-miniprofile="222242102"
                    >SuuSh</a
                  >
                </div>
              </td>
              <td>17</td>
              <td>25</td>
              <td>11</td>
              <td>18</td>
              <td>★5</td>
              <td>60%</td>
              <td>63</td>
              <td
                data-steamid64="76561198182507830"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/chizzarra"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/18d906293a276bc10249bc316ed653b7a5c8a132.jpg"
                      alt=""
                      data-miniprofile="307466724"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/chizzarra"
                    data-miniprofile="307466724"
                    >lamo</a
                  >
                </div>
              </td>
              <td>13</td>
              <td>18</td>
              <td>3</td>
              <td>13</td>
              <td>★5</td>
              <td>33%</td>
              <td>57</td>
              <td
                data-steamid64="76561198267732452"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar online">
                  <a
                    href="https://steamcommunity.com/profiles/76561198876861073"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/f9e7e02b28bf8f1f18c07a5e95cb714b795195fd.jpg"
                      alt=""
                      data-miniprofile="916595345"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561198876861073"
                    data-miniprofile="916595345"
                    >ЗРАДНИК</a
                  >
                </div>
              </td>
              <td>14</td>
              <td>20</td>
              <td>5</td>
              <td>14</td>
              <td>★2</td>
              <td>40%</td>
              <td>52</td>
              <td
                data-steamid64="76561198876861073"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a href="https://steamcommunity.com/id/HardyOff"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/1191c81a57194f64acfcda94f0fd0cb94e92eff7.jpg"
                      alt=""
                      data-miniprofile="969189673"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/id/HardyOff"
                    data-miniprofile="969189673"
                    >Diamond</a
                  >
                </div>
              </td>
              <td>19</td>
              <td>14</td>
              <td>4</td>
              <td>16</td>
              <td>★</td>
              <td>42%</td>
              <td>34</td>
              <td
                data-steamid64="76561198929455401"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
            <tr>
              <td class="inner_name">
                <div class="playerAvatar offline">
                  <a
                    href="https://steamcommunity.com/profiles/76561199106360073"
                    ><img
                      src="https://avatars.akamai.steamstatic.com/ce8e4f7a5e5169b4b81e55a34002b6083b134841.jpg"
                      alt=""
                      data-miniprofile="1146094345"
                  /></a>
                </div>
                <div class="playerNickname ellipsis">
                  <a
                    class="linkTitle"
                    href="https://steamcommunity.com/profiles/76561199106360073"
                    data-miniprofile="1146094345"
                    >Sta1ns</a
                  >
                </div>
              </td>
              <td>5</td>
              <td>5</td>
              <td>3</td>
              <td>18</td>
              <td>&nbsp;</td>
              <td>60%</td>
              <td>13</td>
              <td
                data-steamid64="76561199106360073"
                class="banstatus not-banned"
              >
                clean
              </td>
            </tr>
          </tbody>
        </table>
        <br /><br />
      </td>
    </tr>
  </tbody>
</table>`;

describe('UtilsService', () => {
  let service: UtilsService;
  const element = document.createElement('div');
  beforeEach(() => {
    service = new UtilsService();
  });

  it('test startdate and lastdate with 0 matches', async () => {
    service.getHistoryPeriod();
    expect(service.startDate).toBeUndefined();
    expect(service.endDate).toBeUndefined();
  });

  it('test startdate and lastdate with 3 matches', async () => {
    element.innerHTML = threeMatches;
    document.body.appendChild(element);
    service.getHistoryPeriod();
    expect(service.startDate).toEqual('2024-01-18 20:43:04 GMT');
    expect(service.endDate).toEqual('2024-02-11 12:58:15 GMT');
    document.body.removeChild(element);
  });

  it('test startdate and lastdate with 2 matches', async () => {
    element.innerHTML = twoMatches;
    document.body.appendChild(element);
    service.getHistoryPeriod();
    expect(service.startDate).toEqual('2024-01-18 20:43:04 GMT');
    expect(service.endDate).toEqual('2024-02-11 12:58:15 GMT');
    document.body.removeChild(element);
  });

  it('test startdate and lastdate with 1 matches', async () => {
    element.innerHTML = oneMatch;
    document.body.appendChild(element);
    service.getHistoryPeriod();
    expect(service.startDate).toEqual('2024-01-18 20:43:04 GMT');
    document.body.removeChild(element);
  });

  it('getSteamID64FromMiniProfileId with empty value', async () => {
    const result = service.getSteamID64FromMiniProfileId('');
    expect(result).toEqual('');
  });

  it('getSteamID64FromMiniProfileId with NAN value', async () => {
    const result = service.getSteamID64FromMiniProfileId('lol');
    expect(result).toEqual('');
  });
});
