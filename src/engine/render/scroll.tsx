import { useScroll } from 'ahooks';
import { IScrollProps } from './types';

function Scroll(props: IScrollProps) {
  const { scrollFunc } = props;
  const scroll = useScroll();

  scroll && scrollFunc.forEach(itemfunc => {
    itemfunc(scroll.top);
  });

  return null;
}

export default Scroll;
