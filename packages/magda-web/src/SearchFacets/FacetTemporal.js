import './FacetTemporal.css';
import React, { Component } from 'react';
import FacetWrapper from './FacetWrapper';
import maxBy from 'lodash.maxby';
import DragBar from './DragBar';
import findIndex from 'lodash.findindex';
import defined from '../helpers/defined';

// each facet option has a certain hight in order to calculate drag bar location
const itemHeight = 37;

// the date range facet facet, extends facet component
class FacetTemporal extends Component {
  constructor(props) {
    super(props);
    this.renderDragBar = this.renderDragBar.bind(this);
    this.onResetDateTo = this.onResetDateTo.bind(this);
    this.onResetDateFrom = this.onResetDateFrom.bind(this);
    this.onToggleOption = this.onToggleOption.bind(this);
    this.onDrag = this.onDrag.bind(this);
  }

  onResetDateTo(){
    let datesArray = [this.props.activeDates[0], undefined]
    this.props.onToggleOption(datesArray);
  }

  onResetDateFrom(){
    let datesArray = [undefined, this.props.activeDates[1]]
    this.props.onToggleOption(datesArray);
  }


  onToggleOption(option){
    let tempDateFrom = this.props.activeDates[0];
    let tempDateTo = this.props.activeDates[1];
    if(!defined(tempDateFrom) && !defined(tempDateTo)){
      tempDateFrom = option.lowerBound;
      tempDateTo = option.upperBound;
    }
    if(!defined(tempDateFrom)){
      tempDateFrom = option.lowerBound
    } else if(!defined(tempDateTo)){
      tempDateTo = option.upperBound
    } else{
      if(!defined(tempDateFrom) || (option.lowerBound < tempDateFrom.value) || (option.upperBound === tempDateTo.value)){
        tempDateFrom = lowerBound
      }else {
        tempDateTo = option.upperBound
      }
    }
    let compare = tempDateFrom - tempDateTo;
    let dateFrom = compare >= 0 ? tempDateTo : tempDateFrom;
    let dateTo = compare >= 0 ? tempDateFrom : tempDateTo;
    this.props.onToggleOption([dateFrom, dateTo])
  }

  /**
   * Check if current facet option is active(exists in the url)
   * @param {object} option the current facet option
   */
  checkActiveOption(option){
    let max = defined(this.props.activeDates[1]) ? + this.props.activeDates[1] : 4000;
    let min = defined(this.props.activeDates[0]) ? + this.props.activeDates[0] : 0;
    if((+option.upperBound <= max) && (+option.lowerBound >= min)){
      return true
    }
    return false
  }

  renderOption(option, onClick){
    if(!option){
      return null;
    }
    let divStyle = {
      width: +option.hitCount/maxBy(this.props.options, 'hitCount').hitCount * 160 + 'px'
    }

    return (
    <button type='button'
            className={`${this.checkActiveOption(option) ? 'is-active' : ''} btn-facet-option btn-facet-date-option btn`}
            onClick={onClick.bind(this, option)}>
      <span style={divStyle} className='btn-facet-option__volume-indicator'/>
      <span className='btn-facet-option__name'>{option.value}</span>
      <span className='btn-facet-option__count'>{option.hitCount}</span>
    </button>)
  }

  /**
   * When dragging the dragbar, update the bar positions and update the url
   * @param {number} id id here indicates bar is dragged therefore which property needs updates. if id === 0, then it the top bar being dragged therefore 'dateTo' should be updated
   * @param {number} value the position relative to the wrapper that the drag bar has been dragged to
   */
  onDrag(id, value){
    // the index of the option that the dragged bar position corresponds to
    // offset by one, for the "any end date" option
    let index = Math.floor(value / itemHeight) - 1;
    let date = this.props.options[index];
    let datesArray = this.props.activeDates.slice();

    // only updates if the dragged position is within the range
    if(index > 0 && index < this.props.options.length){
      // if it's upper bound
      if(id === 0){
        datesArray[1] = date.upperBound;
      } else{
        datesArray[0] = date.lowerBound;
      }
    } else{
      if(id=== 0){
        datesArray[1] = date.upperBound;
      } else {
        datesArray[0] = date.lowerBound;
      }
    }
    this.props.onToggleOption(datesArray);
  }

  renderDragBar(){
    // the height of the dragbar should be the same with the height of all the options + any start date + any end date
    // remove last padding
    let height = (this.props.options.length + 2) * itemHeight - 4;
    let fromIndex = defined(this.props.activeDates[0]) ? findIndex(this.props.options, o=>o.lowerBound === this.props.activeDates[0]) + 1 : this.props.options.length + 1;
    let toIndex = defined(this.props.activeDates[1]) ? findIndex(this.props.options, o=>o.upperBound === this.props.activeDates[1]) + 1 : 0;
    let dragBarData=[(toIndex * itemHeight), (fromIndex * itemHeight)];
    return <DragBar dragBarData={dragBarData} onDrag={this.onDrag} height={height}/>
  }

  render(){
    let that = this;
    return <FacetWrapper onResetFacet={this.props.onResetFacet}
                         title={this.props.title}
                         activeDates={this.props.activeDates}
                         hasQuery={this.props.hasQuery}>
             <div className='clearfix facet-temporal'>
               <div className='slider'>
                 {this.renderDragBar()}
               </div>
               <ul className='list-unstyled list'>
                <li><button className='btn btn-facet-option btn-facet-date-option' onClick={this.onResetDateTo}>Any end date </button></li>
                 {that.props.options.map(o=><li key={o.value}>{that.renderOption(o, this.onToggleOption)}</li>)}
                 <li><button className='btn btn-facet-option btn-facet-date-option' onClick={this.onResetDateFrom}>Any start date </button></li>
               </ul>
             </div>
           </FacetWrapper>
  }
}

export default FacetTemporal;
